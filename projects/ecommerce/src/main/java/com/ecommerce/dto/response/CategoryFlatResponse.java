package com.ecommerce.dto.response;

public record CategoryFlatResponse(
    Long id,
    String name,
    String description,
    Long parentId,
    String parentName,
    int depth,
    boolean hasChildren
) {}