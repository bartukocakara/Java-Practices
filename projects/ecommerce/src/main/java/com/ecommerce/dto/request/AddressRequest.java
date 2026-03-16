package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;

public record AddressRequest(
    @NotBlank @Size(max = 50)
    String title,

    @NotBlank @Size(max = 100)
    String fullName,

    @NotBlank @Size(max = 20)
    String phone,

    @NotBlank @Size(max = 255)
    String addressLine,

    @NotBlank @Size(max = 100)
    String city,

    @NotBlank @Size(max = 100)
    String country,

    boolean isDefault
) {}