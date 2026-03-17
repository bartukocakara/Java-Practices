package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;

public record CartItemRequest(
    @NotNull Long    productId,
    Long             variantId,   // nullable — no @NotNull
    @NotNull @Min(1) Integer quantity
) {}