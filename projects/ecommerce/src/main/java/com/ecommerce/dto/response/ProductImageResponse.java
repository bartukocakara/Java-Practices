package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public record ProductImageResponse(
    Long id,
    String imageUrl,
    Boolean isPrimary,
    Integer sortOrder,
    LocalDateTime createdAt
) {}