package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    Long id,
    List<CartItemResponse> items,
    BigDecimal totalAmount
) {
    public record CartItemResponse(
        Long       cartItemId,
        Long       productId,
        Long       variantId,     // ← add
        String     productName,
        String     variantLabel,  // ← add e.g. "38 / Black"
        BigDecimal unitPrice,
        Integer    quantity,
        BigDecimal subtotal
    ) {}
}