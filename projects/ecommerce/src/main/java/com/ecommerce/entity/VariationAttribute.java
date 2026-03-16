package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "variation_attributes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VariationAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL)
    private List<VariationAttributeValue> values;
}