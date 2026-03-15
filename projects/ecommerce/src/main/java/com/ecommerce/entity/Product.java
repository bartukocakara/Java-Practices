package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
           orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, createdAt ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    // Helper — get primary image url
    @Transient
    public String getPrimaryImageUrl() {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
            .filter(ProductImage::getIsPrimary)
            .findFirst()
            .orElse(images.get(0))
            .getImageUrl();
    }

    @Column(unique = true, nullable = false, length = 255)
    private String slug;

    // Auto-generate slug before first persist if somehow missed
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (slug == null || slug.isBlank()) {
            // fallback — will be overwritten by service with proper slug
            slug = "product-" + System.currentTimeMillis();
        }
    }
}