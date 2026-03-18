package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;

public record UpdateStoreRequest(
    @NotBlank @Size(max = 100)
    String storeName,

    @Size(max = 1000)
    String description,

    @NotBlank @Email
    String email,

    @Size(max = 20)
    String phone,

    @Size(max = 255)
    String address
) {}