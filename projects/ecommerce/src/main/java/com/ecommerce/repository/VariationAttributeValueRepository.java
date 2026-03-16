package com.ecommerce.repository;

import com.ecommerce.entity.VariationAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VariationAttributeValueRepository extends JpaRepository<VariationAttributeValue, Long> {

    List<VariationAttributeValue> findByAttributeId(Long attributeId);

    Optional<VariationAttributeValue> findByAttributeIdAndValue(Long attributeId, String value);

    boolean existsByAttributeIdAndValue(Long attributeId, String value);
}