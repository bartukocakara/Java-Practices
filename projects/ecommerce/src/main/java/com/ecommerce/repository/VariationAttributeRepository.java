package com.ecommerce.repository;

import com.ecommerce.entity.VariationAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VariationAttributeRepository extends JpaRepository<VariationAttribute, Long> {

    Optional<VariationAttribute> findByName(String name);

    boolean existsByName(String name);

    // All attributes with their values eagerly loaded
    @Query("SELECT a FROM VariationAttribute a LEFT JOIN FETCH a.values ORDER BY a.name")
    List<VariationAttribute> findAllWithValues();
}