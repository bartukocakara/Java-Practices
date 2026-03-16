package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variation_attribute_values")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VariationAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private VariationAttribute attribute;

    @Column(nullable = false)
    private String value;
}