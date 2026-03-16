package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;

public record CreateVariantRequest(
    @NotBlank
    String sku,

    @NotNull @DecimalMin("0.01")
    BigDecimal price,

    @NotNull @Min(0)
    Integer stock,

    // attribute_id → value_id mapping
    // e.g. {1: 5, 2: 16}  (Size:XL, Color:Red)
    Map<Long, Long> attributeValueIds
) {}