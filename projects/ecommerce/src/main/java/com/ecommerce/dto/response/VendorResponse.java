package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VendorResponse(
    Long id,
    String storeName,
    String storeSlug,
    String description,
    String logoUrl,
    String bannerUrl,
    String email,
    String phone,
    String status,
    BigDecimal commissionRate,
    Integer totalSales,
    Double rating,
    String username,
    LocalDateTime createdAt
) {}