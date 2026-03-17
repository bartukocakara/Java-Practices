package com.ecommerce.service;

import com.ecommerce.dto.request.CreateVariantRequest;
import com.ecommerce.dto.request.VendorProductRequest;
import com.ecommerce.dto.response.ProductImageResponse;
import com.ecommerce.dto.response.ProductVariantResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VendorProductService {

    private final ProductRepository         productRepository;
    private final ProductVariantRepository  variantRepository;
    private final CategoryRepository        categoryRepository;
    private final VendorRepository          vendorRepository;
    private final UserRepository            userRepository;
    private final ReviewRepository          reviewRepository;
    private final OrderRepository           orderRepository;
    private final SlugService               slugService;
    private final ProductImageService       productImageService;  // ← add
    private final ProductVariantService     variantService;

    // ── Get vendor's products ──
    public List<ProductResponse> getVendorProducts(String username,
                                                    String status,
                                                    Boolean lowStock) {
        Vendor vendor = findVendor(username);
        List<Product> products = productRepository.findByVendorIdOrderByCreatedAtDesc(
            vendor.getId());

        return products.stream()
            .filter(p -> status == null || p.getStatus().equalsIgnoreCase(status))
            .filter(p -> lowStock == null || !lowStock ||
                p.getStock() <= 5 && !p.getStatus().equals("DELETED"))
            .map(this::toResponse)
            .toList();
    }

    public ProductResponse getVendorProduct(String username, Long productId) {
        Vendor vendor   = findVendor(username);
        Product product = findAndVerify(vendor, productId);
        return toResponse(product);
    }

    // ── Create ──
    @Transactional
    public ProductResponse createProduct(String username,
                                          VendorProductRequest request) {
        Vendor vendor = findVendor(username);

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Category", request.categoryId()));

        String slug = slugService.generateUniqueSlug(request.name());

        Product product = Product.builder()
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .basePrice(request.price())
            .stock(request.stock())
            .slug(slug)
            .category(category)
            .vendorId(vendor.getId())
            .status(request.status() != null ? request.status() : "ACTIVE")
            .averageRating(0.0)
            .reviewCount(0)
            .build();

        return toResponse(productRepository.save(product));
    }

    // ── Update ──
    @Transactional
    public ProductResponse updateProduct(String username, Long productId,
                                          VendorProductRequest request) {
        Vendor vendor   = findVendor(username);
        Product product = findAndVerify(vendor, productId);

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Category", request.categoryId()));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(category);
        product.setStock(request.stock());
        if (request.status() != null) product.setStatus(request.status());

        return toResponse(productRepository.save(product));
    }

    // ── Delete ──
    @Transactional
    public void deleteProduct(String username, Long productId) {
        Vendor vendor   = findVendor(username);
        Product product = findAndVerify(vendor, productId);
        // Soft delete
        product.setStatus("DELETED");
        productRepository.save(product);
    }

    // ── Toggle status ──
    @Transactional
    public ProductResponse updateProductStatus(String username,
                                                Long productId,
                                                String status) {
        Vendor vendor   = findVendor(username);
        Product product = findAndVerify(vendor, productId);
        product.setStatus(status.toUpperCase());
        return toResponse(productRepository.save(product));
    }

    // ── Variants ──
    public List<ProductVariantResponse> getVariants(Long productId) {
        return variantRepository.findByProductIdOrderByPriceAsc(productId)
            .stream().map(variantService::toResponse).toList();
    }

    @Transactional
    public ProductVariantResponse addVariant(String username, Long productId,
                                              CreateVariantRequest request) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        return variantService.create(productId, request);
    }

    @Transactional
    public ProductVariantResponse updateVariant(String username, Long productId,
                                                 Long variantId,
                                                 CreateVariantRequest request) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);

        ProductVariant variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

        variant.setPrice(request.price());
        variant.setStock(request.stock());
        variant.setSku(request.sku());

        return variantService.toResponse(variantRepository.save(variant));
    }

    @Transactional
    public void deleteVariant(String username, Long productId, Long variantId) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        variantRepository.deleteById(variantId);
    }

    @Transactional
    public ProductVariantResponse updateVariantStock(String username,
                                                      Long productId,
                                                      Long variantId,
                                                      Integer stock) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        return variantService.updateStock(variantId, stock);
    }

    // ── Images ──
    @Transactional
    public ProductImageResponse uploadImage(String username, Long productId,
                                            MultipartFile file,
                                            boolean primary) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        // Delegate entirely to ProductImageService
        return productImageService.uploadImage(productId, file, primary);
    }

    @Transactional
    public void deleteImage(String username, Long productId, Long imageId) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        productImageService.deleteImage(productId, imageId);
    }

    @Transactional
    public void setPrimaryImage(String username, Long productId, Long imageId) {
        Vendor vendor = findVendor(username);
        findAndVerify(vendor, productId);
        productImageService.setPrimary(productId, imageId);
    }

    // ── Stats ──
    public Map<String, Object> getProductStats(String username, Long productId) {
        Vendor vendor   = findVendor(username);
        Product product = findAndVerify(vendor, productId);

        List<Review> reviews = reviewRepository.findByProductId(productId);

        // Total units sold from delivered orders
        long unitsSold = orderRepository.findAll().stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED)
            .flatMap(o -> o.getItems().stream())
            .filter(i -> i.getProduct().getId().equals(productId))
            .mapToLong(i -> i.getQuantity())
            .sum();

        BigDecimal revenue = orderRepository.findAll().stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED)
            .flatMap(o -> o.getItems().stream())
            .filter(i -> i.getProduct().getId().equals(productId))
            .map(i -> i.getUnitPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("productId",     productId);
        stats.put("productName",   product.getName());
        stats.put("unitsSold",     unitsSold);
        stats.put("revenue",       revenue);
        stats.put("reviewCount",   reviews.size());
        stats.put("averageRating", product.getAverageRating());
        stats.put("currentStock",  product.getStock());
        stats.put("status",        product.getStatus());

        return stats;
    }

    // ── Helpers ──
    private Vendor findVendor(String username) {
        return userRepository.findByUsername(username)
            .map(u -> vendorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new AccessDeniedException("Not a vendor")))
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private Product findAndVerify(Vendor vendor, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        if (!vendor.getId().equals(product.getVendorId()))
            throw new AccessDeniedException("This product does not belong to you");
        return product;
    }

    private ProductResponse toResponse(Product p) {
        List<ProductVariantResponse> variants = p.getVariants() == null
            ? List.of()
            : p.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(variantService::toResponse)
                .toList();

        List<ProductImageResponse> images = p.getImages() == null
            ? List.of()
            : p.getImages().stream()
                .map(img -> new ProductImageResponse(
                    img.getId(), img.getImageUrl(),
                    img.getIsPrimary(), img.getSortOrder(),
                    img.getCreatedAt()))
                .toList();

        BigDecimal basePrice = p.getBasePrice() != null
            ? p.getBasePrice() : p.getPrice();
        BigDecimal maxPrice  = variants.stream()
            .map(ProductVariantResponse::price)
            .max(BigDecimal::compareTo).orElse(basePrice);
        Integer totalStock   = variants.isEmpty() ? p.getStock()
            : variants.stream().mapToInt(ProductVariantResponse::stock).sum();

        return new ProductResponse(
            p.getId(), p.getName(), p.getDescription(),
            basePrice, maxPrice, totalStock,
            p.getCategory() != null ? p.getCategory().getName() : null,
            p.getVendorId(), null, null,
            p.getAverageRating(), p.getReviewCount(),
            p.getPrimaryImageUrl(), images, variants,
            p.getSlug(), !variants.isEmpty()
        );
    }

    private ProductImageResponse toImageResponse(ProductImage img) {
        return new ProductImageResponse(
            img.getId(), img.getImageUrl(),
            img.getIsPrimary(), img.getSortOrder(),
            img.getCreatedAt());
    }
}