package com.ecommerce.repository;

import com.ecommerce.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUserId(Long userId);

    Optional<Vendor> findByStoreSlug(String storeSlug);

    boolean existsByStoreName(String storeName);

    boolean existsByStoreSlug(String storeSlug);

    List<Vendor> findByStatusOrderByCreatedAtDesc(Vendor.Status status);

    @Query("""
        SELECT COUNT(p) FROM Product p
        WHERE p.vendorId = :vendorId
        AND p.status = 'ACTIVE'
        """)
    Integer countActiveProducts(@Param("vendorId") Long vendorId);

    @Query("""
        SELECT COUNT(p) FROM Product p
        WHERE p.vendorId = :vendorId
        AND p.stock <= 5
        AND p.status = 'ACTIVE'
        """)
    Integer countLowStockProducts(@Param("vendorId") Long vendorId);
}