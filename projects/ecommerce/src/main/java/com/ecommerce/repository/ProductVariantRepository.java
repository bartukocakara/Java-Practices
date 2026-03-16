package com.ecommerce.repository;

import com.ecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // All variants for a product — ordered by price
    List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);

    // Only active variants
    List<ProductVariant> findByProductIdAndIsActiveTrueOrderByPriceAsc(Long productId);

    // SKU lookup
    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);

    // Total stock across all variants of a product
    @Query("SELECT COALESCE(SUM(v.stock), 0) FROM ProductVariant v WHERE v.product.id = :productId")
    Integer sumStockByProductId(@Param("productId") Long productId);

    // Lowest price variant for a product (for base price display)
    @Query("SELECT MIN(v.price) FROM ProductVariant v WHERE v.product.id = :productId AND v.isActive = true")
    Optional<BigDecimal> findLowestPriceByProductId(@Param("productId") Long productId);

    // Highest price variant (for price range display)
    @Query("SELECT MAX(v.price) FROM ProductVariant v WHERE v.product.id = :productId AND v.isActive = true")
    Optional<BigDecimal> findHighestPriceByProductId(@Param("productId") Long productId);

    // Count variants per product
    int countByProductId(Long productId);

    // Count active variants per product
    int countByProductIdAndIsActiveTrue(Long productId);

    // Check if any in-stock variant exists
    @Query("SELECT COUNT(v) > 0 FROM ProductVariant v WHERE v.product.id = :productId AND v.stock > 0 AND v.isActive = true")
    boolean hasInStockVariants(@Param("productId") Long productId);

    // Deduct stock atomically — prevents race conditions
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stock = v.stock - :quantity WHERE v.id = :variantId AND v.stock >= :quantity")
    int deductStock(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Restock — used when order is cancelled
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stock = v.stock + :quantity WHERE v.id = :variantId")
    void restoreStock(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Low stock alert — find variants below threshold
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.stock <= :threshold AND v.isActive = true")
    List<ProductVariant> findLowStockVariants(@Param("productId") Long productId, @Param("threshold") int threshold);

    // All low stock variants across all products (for admin dashboard)
    @Query("SELECT v FROM ProductVariant v WHERE v.stock <= :threshold AND v.isActive = true ORDER BY v.stock ASC")
    List<ProductVariant> findAllLowStockVariants(@Param("threshold") int threshold);

    // Delete all variants for a product
    void deleteByProductId(Long productId);
}