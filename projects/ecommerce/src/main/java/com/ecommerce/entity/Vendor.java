package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vendor {

    public enum Status { PENDING, ACTIVE, SUSPENDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 100)
    private String storeName;

    @Column(nullable = false, unique = true, length = 100)
    private String storeSlug;

    private String description;
    private String logoUrl;
    private String bannerUrl;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("10.00");

    @Builder.Default
    private Integer totalSales = 0;

    @Builder.Default
    private Double rating = 0.0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}