package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    String username,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {}