package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductImageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.dto.response.ProductVariantResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final SlugService         slugService;
    private final ProductVariantService variantService;

    public Page<ProductResponse> getAll(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    // In ProductService — update filter method
    public Page<ProductResponse> filter(Long categoryId, BigDecimal minPrice,
                                     BigDecimal maxPrice, String name,
                                     int page, int size,
                                     String sortBy, String direction) {

        // Use offset pageable without sort — ORDER BY is in the native query
        Pageable pageable = PageRequest.of(page, size);

        // Sanitize sortBy to prevent SQL injection
        String safeSortBy = switch (sortBy) {
            case "price", "name", "createdAt" -> sortBy;
            default -> "name";
        };
        String safeDirection = direction.equalsIgnoreCase("desc") ? "desc" : "asc";

        if (categoryId == null) {
            return productRepository.filter(
                null, minPrice, maxPrice, name, safeSortBy, safeDirection, pageable
            ).map(this::toResponse);
        }

        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        categoryRepository.findAllDescendants(categoryId)
            .forEach(row -> ids.add(((Number) row[0]).longValue()));

        return productRepository.filterByCategoryIds(
            ids, minPrice, maxPrice, name, safeSortBy, safeDirection, pageable
        ).map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
    Product product = productRepository.findByIdWithVariants(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    productRepository.findByIdWithImages(id)
        .ifPresent(p -> product.setImages(p.getImages()));
    return toResponse(product);
}

    public List<ProductResponse> getByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name)
            .stream().map(this::toResponse).toList();
    }

    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId()));

        Product product = Product.builder()
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .stock(request.stock())
            .category(category)
            .averageRating(0.0)
            .reviewCount(0)
            .slug("temp") // temporary — will be replaced after ID is assigned
            .build();

        // Save once to get the generated ID
        Product saved = productRepository.save(product);

        // Now generate slug with real ID — guaranteed unique
        saved.setSlug(slugService.generateSlug(saved.getName(), saved.getId()));

        return toResponse(productRepository.save(saved));
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findOrThrow(id);
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId()));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setCategory(category);

        // Regenerate slug when name changes
        product.setSlug(slugService.regenerateSlug(request.name(), id));

        return toResponse(productRepository.save(product));
    }

    public ProductResponse getBySlug(String slug) {
        // Fetch variants
        Product product = productRepository.findBySlugWithVariants(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product", 0L));

        // Fetch images separately and merge
        productRepository.findBySlugWithImages(slug)
            .ifPresent(p -> product.setImages(p.getImages()));

        return toResponse(product);
    }

    public void delete(Long id) {
        productRepository.delete(findOrThrow(id));
    }

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductResponse toResponse(Product p) {
        String vendorName = null;
        String vendorSlug = null;
        Long   vendorId   = p.getVendorId();

        if (vendorId != null) {
            vendorRepository.findById(vendorId).ifPresent(v -> {
                // Can't set local vars from lambda — use array trick
            });
            // Better approach:
            var vendor = vendorRepository.findById(vendorId).orElse(null);
            if (vendor != null) {
                vendorName = vendor.getStoreName();
                vendorSlug = vendor.getStoreSlug();
            }
        }
        List<ProductImageResponse> images = p.getImages() == null
            ? List.of()
            : p.getImages().stream()
                .map(img -> new ProductImageResponse(
                    img.getId(),
                    img.getImageUrl(),
                    img.getIsPrimary(),
                    img.getSortOrder(),
                    img.getCreatedAt()
                ))
                .sorted(Comparator.comparingInt(ProductImageResponse::sortOrder))
                .toList();

        List<ProductVariantResponse> variants = p.getVariants() == null
            ? List.of()
            : p.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(variantService::toResponse)
                .toList();

        BigDecimal basePrice = p.getBasePrice() != null ? p.getBasePrice() : p.getPrice();

        BigDecimal maxPrice = variants.stream()
            .map(ProductVariantResponse::price)
            .max(BigDecimal::compareTo)
            .orElse(basePrice);

        Integer totalStock = variants.isEmpty()
            ? p.getStock()
            : variants.stream().mapToInt(ProductVariantResponse::stock).sum();

        return new ProductResponse(
            p.getId(), p.getName(), p.getDescription(),
            basePrice, maxPrice, totalStock,
            p.getCategory() != null ? p.getCategory().getName() : null,
            vendorId,
            vendorName,   // ← was null before
            vendorSlug,   // ← was null before
            p.getAverageRating(), p.getReviewCount(),
            p.getPrimaryImageUrl(), images, variants,
            p.getSlug(), !variants.isEmpty()
        );
    }
}