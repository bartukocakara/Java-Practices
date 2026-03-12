package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Only root categories (no parent)
    List<Category> findByParentIsNull();

    // Direct children of a category
    List<Category> findByParentId(Long parentId);

    // Check name uniqueness within same parent
    boolean existsByNameAndParentId(String name, Long parentId);

    // Check name uniqueness for root categories
    boolean existsByNameAndParentIsNull(String name);

    Optional<Category> findByName(String name);

    // Fetch category with its children eagerly
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.id = :id")
    Optional<Category> findByIdWithChildren(@Param("id") Long id);

    // All descendants using recursive CTE (PostgreSQL)
    @Query(value = """
        WITH RECURSIVE descendants AS (
            SELECT id, name, description, parent_id, 0 as depth
            FROM categories
            WHERE id = :rootId
            UNION ALL
            SELECT c.id, c.name, c.description, c.parent_id, d.depth + 1
            FROM categories c
            INNER JOIN descendants d ON c.parent_id = d.id
        )
        SELECT * FROM descendants
        """, nativeQuery = true)
    List<Object[]> findAllDescendants(@Param("rootId") Long rootId);
}