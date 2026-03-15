package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductImageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SlugService         slugService;
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
                                     int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        // If no categoryId use the simple filter query
        if (categoryId == null) {
            return productRepository.filter(
                null, minPrice, maxPrice, name, pageable
            ).map(this::toResponse);
        }

        // Build category id list including all descendants
        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        categoryRepository.findAllDescendants(categoryId)
            .forEach(row -> ids.add(((Number) row[0]).longValue()));

        return productRepository.filterByCategoryIds(
            ids, minPrice, maxPrice, name, pageable
        ).map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
        return toResponse(findOrThrow(id));
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
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product", 0L));
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
        List<ProductImageResponse> images = p.getImages() == null
            ? List.of()
            : p.getImages().stream().map(img -> new ProductImageResponse(
                img.getId(),
                img.getImageUrl(),
                img.getIsPrimary(),
                img.getSortOrder(),
                img.getCreatedAt()
            )).toList();

        return new ProductResponse(
            p.getId(),
            p.getName(),
            p.getDescription(),
            p.getPrice(),
            p.getStock(),
            p.getCategory() != null ? p.getCategory().getName() : null,
            p.getAverageRating(),
            p.getReviewCount(),
            p.getPrimaryImageUrl(),
            images,
            p.getSlug()
        );
    }
}