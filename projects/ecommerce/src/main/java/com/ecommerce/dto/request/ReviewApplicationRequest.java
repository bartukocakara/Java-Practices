package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReviewApplicationRequest(
    @NotBlank String decision,  // APPROVED or REJECTED
    String adminNote
) {}