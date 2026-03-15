package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    String categoryName,
    Double averageRating,
    Integer reviewCount,
    String primaryImageUrl,
    List<ProductImageResponse> images,
    String slug
) {}