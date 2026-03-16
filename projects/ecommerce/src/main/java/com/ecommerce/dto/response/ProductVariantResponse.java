package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public record ProductVariantResponse(
    Long   id,
    String sku,
    BigDecimal price,
    Integer stock,
    Boolean isActive,
    String imageUrl,
    String displayLabel,
    Map<String, String> attributes  // {"Size":"XL", "Color":"Red"}
) {}