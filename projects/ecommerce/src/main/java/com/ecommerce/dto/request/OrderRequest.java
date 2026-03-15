package com.ecommerce.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    String fullName,

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    String phone,

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    String addressLine,

    @NotBlank(message = "City is required")
    @Size(max = 100)
    String city,

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    String country,

    @NotBlank(message = "Payment method is required")
    String paymentMethod,

    String notes,

    @NotNull @Valid
    List<OrderItemRequest> items
) {
    public record OrderItemRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
    ) {}
}