package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;

public record VendorApplicationRequest(
    @NotBlank @Size(max = 100)
    String storeName,

    @NotBlank @Size(max = 255)
    String description,

    @NotBlank @Email
    String email,

    @Size(max = 20)
    String phone,

    @Size(max = 255)
    String address
) {}