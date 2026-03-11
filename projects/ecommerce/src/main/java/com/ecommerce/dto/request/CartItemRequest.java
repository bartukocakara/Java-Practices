package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;

public record CartItemRequest(
    @NotNull Long productId,
    @NotNull @Min(1) Integer quantity
) {}