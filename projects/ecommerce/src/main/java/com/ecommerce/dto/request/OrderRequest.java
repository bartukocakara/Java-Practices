package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
    @NotEmpty List<OrderItemRequest> items
) {
    public record OrderItemRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
    ) {}
}