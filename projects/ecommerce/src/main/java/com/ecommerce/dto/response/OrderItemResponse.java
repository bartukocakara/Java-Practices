package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public record OrderItemResponse(
    Long          id,
    Long          productId,
    String        productName,
    Long          variantId,
    Map<String, String> variantInfo,
    Integer       quantity,
    BigDecimal    unitPrice,
    BigDecimal    subtotal
) {}