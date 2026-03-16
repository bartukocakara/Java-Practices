package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public record VendorApplicationResponse(
    Long id,
    String storeName,
    String storeSlug,
    String description,
    String email,
    String phone,
    String address,
    String status,
    String adminNote,
    String username,
    LocalDateTime createdAt,
    LocalDateTime reviewedAt
) {}