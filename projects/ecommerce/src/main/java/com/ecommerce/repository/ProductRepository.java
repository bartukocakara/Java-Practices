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
        WHERE (:categoryId IS NULL OR p.category_id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        ORDER BY
            CASE WHEN :sortBy = 'name'       AND :direction = 'asc'  THEN p.name       END ASC,
            CASE WHEN :sortBy = 'name'       AND :direction = 'desc' THEN p.name       END DESC,
            CASE WHEN :sortBy = 'price'      AND :direction = 'asc'  THEN p.price      END ASC,
            CASE WHEN :sortBy = 'price'      AND :direction = 'desc' THEN p.price      END DESC,
            CASE WHEN :sortBy = 'createdAt'  AND :direction = 'asc'  THEN p.created_at END ASC,
            CASE WHEN :sortBy = 'createdAt'  AND :direction = 'desc' THEN p.created_at END DESC
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
        @Param("minPrice")   BigDecimal minPrice,
        @Param("maxPrice")   BigDecimal maxPrice,
        @Param("name")       String name,
        @Param("sortBy")     String sortBy,
        @Param("direction")  String direction,
        Pageable pageable
    );

    @Query(value = """
        SELECT * FROM products p
        WHERE p.category_id IN (:categoryIds)
        AND (:minPrice IS NULL OR p.price >= CAST(:minPrice AS NUMERIC))
        AND (:maxPrice IS NULL OR p.price <= CAST(:maxPrice AS NUMERIC))
        AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS VARCHAR)))
        ORDER BY
            CASE WHEN :sortBy = 'name'       AND :direction = 'asc'  THEN p.name       END ASC,
            CASE WHEN :sortBy = 'name'       AND :direction = 'desc' THEN p.name       END DESC,
            CASE WHEN :sortBy = 'price'      AND :direction = 'asc'  THEN p.price      END ASC,
            CASE WHEN :sortBy = 'price'      AND :direction = 'desc' THEN p.price      END DESC,
            CASE WHEN :sortBy = 'createdAt'  AND :direction = 'asc'  THEN p.created_at END ASC,
            CASE WHEN :sortBy = 'createdAt'  AND :direction = 'desc' THEN p.created_at END DESC
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
        @Param("minPrice")    BigDecimal minPrice,
        @Param("maxPrice")    BigDecimal maxPrice,
        @Param("name")        String name,
        @Param("sortBy")      String sortBy,
        @Param("direction")   String direction,
        Pageable pageable
    );

    Integer countByVendorId(Long vendorId);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.attributeValues av
        LEFT JOIN FETCH av.attribute
        LEFT JOIN FETCH av.value
        WHERE p.slug = :slug
        """)
    Optional<Product> findBySlugWithVariants(@Param("slug") String slug);

    // Step 2: fetch product + images separately
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.images
        WHERE p.slug = :slug
        """)
    Optional<Product> findBySlugWithImages(@Param("slug") String slug);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.attributeValues av
        LEFT JOIN FETCH av.attribute
        LEFT JOIN FETCH av.value
        WHERE p.id = :id
        """)
    Optional<Product> findByIdWithVariants(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.images
        WHERE p.id = :id
        """)
    Optional<Product> findByIdWithImages(@Param("id") Long id);
}