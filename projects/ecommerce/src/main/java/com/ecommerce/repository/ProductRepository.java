package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContainingIgnoreCase(String name);

    // Simple filter — no category or single category
    @Query(value = """
        SELECT * FROM products p
        WHERE (:categoryId IS NULL OR p.category_id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        """,
        countQuery = """
        SELECT COUNT(*) FROM products p
        WHERE (:categoryId IS NULL OR p.category_id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        """,
        nativeQuery = true)
    Page<Product> filter(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("name") String name,
        Pageable pageable
    );
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);
    
    Optional<Product> findByIdOrSlug(Long id, String slug);

    // Filter by multiple category ids (for subcategory tree)
    @Query(value = """
        SELECT * FROM products p
        WHERE p.category_id IN (:categoryIds)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        """,
        countQuery = """
        SELECT COUNT(*) FROM products p
        WHERE p.category_id IN (:categoryIds)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        """,
        nativeQuery = true)
    Page<Product> filterByCategoryIds(
        @Param("categoryIds") List<Long> categoryIds,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("name") String name,
        Pageable pageable
    );
}