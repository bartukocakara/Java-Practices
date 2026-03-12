package com.ecommerce.dto.response;

import java.util.List;

public record CategoryResponse(
    Long id,
    String name,
    String description,
    Long parentId,
    String parentName,
    List<CategoryResponse> children  // recursive
) {}