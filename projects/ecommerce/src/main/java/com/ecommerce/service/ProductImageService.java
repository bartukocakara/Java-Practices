package com.ecommerce.service;

import com.ecommerce.dto.response.ProductImageResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository      productRepository;
    private final FileStorageService     fileStorageService;

    private static final int MAX_IMAGES_PER_PRODUCT = 8;

    public List<ProductImageResponse> getImages(Long productId) {
        findProductOrThrow(productId);
        return productImageRepository
            .findByProductIdOrderBySortOrderAscCreatedAtAsc(productId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public ProductImageResponse uploadImage(Long productId, MultipartFile file,
                                            boolean isPrimary) {
        Product product = findProductOrThrow(productId);

        int count = productImageRepository.countByProductId(productId);
        if (count >= MAX_IMAGES_PER_PRODUCT)
            throw new IllegalArgumentException(
                "Maximum " + MAX_IMAGES_PER_PRODUCT + " images allowed per product");

        String imageUrl = fileStorageService.store(file, "products");

        // If this is primary or it's the first image, clear existing primary
        if (isPrimary || count == 0) {
            productImageRepository.clearPrimaryForProduct(productId);
        }

        ProductImage image = ProductImage.builder()
            .product(product)
            .imageUrl(imageUrl)
            .isPrimary(isPrimary || count == 0)
            .sortOrder(count)
            .build();

        return toResponse(productImageRepository.save(image));
    }

    @Transactional
    public ProductImageResponse setPrimary(Long productId, Long imageId) {
        findProductOrThrow(productId);

        ProductImage image = productImageRepository.findById(imageId)
            .orElseThrow(() -> new ResourceNotFoundException("Image", imageId));

        if (!image.getProduct().getId().equals(productId))
            throw new IllegalArgumentException("Image does not belong to this product");

        // Clear current primary then set new one
        productImageRepository.clearPrimaryForProduct(productId);
        image.setIsPrimary(true);
        return toResponse(productImageRepository.save(image));
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        findProductOrThrow(productId);

        ProductImage image = productImageRepository.findById(imageId)
            .orElseThrow(() -> new ResourceNotFoundException("Image", imageId));

        if (!image.getProduct().getId().equals(productId))
            throw new IllegalArgumentException("Image does not belong to this product");

        boolean wasPrimary  = image.getIsPrimary();
        int     deletedOrder = image.getSortOrder();

        // Delete physical file
        fileStorageService.delete(image.getImageUrl());
        productImageRepository.delete(image);

        // Re-order remaining images
        productImageRepository.decrementSortOrderAfter(productId, deletedOrder);

        // If deleted image was primary, promote the first remaining image
        if (wasPrimary) {
            productImageRepository
                .findByProductIdOrderBySortOrderAscCreatedAtAsc(productId)
                .stream()
                .findFirst()
                .ifPresent(first -> {
                    first.setIsPrimary(true);
                    productImageRepository.save(first);
                });
        }
    }

    @Transactional
    public void deleteAllImages(Long productId) {
        productImageRepository
            .findByProductIdOrderBySortOrderAscCreatedAtAsc(productId)
            .forEach(img -> fileStorageService.delete(img.getImageUrl()));
        productImageRepository.deleteAll(
            productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId)
        );
    }

    private Product findProductOrThrow(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
    }

    private ProductImageResponse toResponse(ProductImage img) {
        return new ProductImageResponse(
            img.getId(),
            img.getImageUrl(),
            img.getIsPrimary(),
            img.getSortOrder(),
            img.getCreatedAt()
        );
    }
}