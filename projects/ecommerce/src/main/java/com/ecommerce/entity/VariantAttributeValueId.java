package com.ecommerce.entity;

import java.io.Serializable;

public class VariantAttributeValueId implements Serializable {
    private Long variant;
    private Long attribute;

    public VariantAttributeValueId() {}
    public VariantAttributeValueId(Long variant, Long attribute) {
        this.variant   = variant;
        this.attribute = attribute;
    }
}