package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public record AddressResponse(
    Long id,
    String title,
    String fullName,
    String phone,
    String addressLine,
    String city,
    String country,
    Boolean isDefault,
    LocalDateTime createdAt
) {}