package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record VendorProductRequest(
    @NotBlank @Size(max = 255)
    String name,

    @Size(max = 2000)
    String description,

    @NotNull @DecimalMin("0.01")
    BigDecimal price,

    @NotNull @Min(0)
    Integer stock,

    @NotNull
    Long categoryId,

    String status
) {}