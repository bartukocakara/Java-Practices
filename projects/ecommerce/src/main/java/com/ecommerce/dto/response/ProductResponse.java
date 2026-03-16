package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    BigDecimal maxPrice,
    Integer stock,
    String categoryName,
    Long vendorId,
    String vendorName,
    String vendorSlug,
    Double averageRating,
    Integer reviewCount,
    String primaryImageUrl,
    List<ProductImageResponse> images,
    List<ProductVariantResponse> variants,
    String slug,
    boolean hasVariants
) {}