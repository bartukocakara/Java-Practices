package com.ecommerce.repository;

import com.ecommerce.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAscCreatedAtAsc(Long productId);

    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);

    int countByProductId(Long productId);

    @Modifying
    @Query("UPDATE ProductImage i SET i.isPrimary = false WHERE i.product.id = :productId")
    void clearPrimaryForProduct(@Param("productId") Long productId);

    @Modifying
    @Query("""
        UPDATE ProductImage i SET i.sortOrder = i.sortOrder - 1
        WHERE i.product.id = :productId AND i.sortOrder > :sortOrder
        """)
    void decrementSortOrderAfter(
        @Param("productId") Long productId,
        @Param("sortOrder") int sortOrder
    );
}