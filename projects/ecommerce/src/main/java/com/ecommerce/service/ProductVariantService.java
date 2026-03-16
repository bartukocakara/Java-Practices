package com.ecommerce.service;

import com.ecommerce.dto.request.CreateVariantRequest;
import com.ecommerce.dto.response.ProductVariantResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository      variantRepository;
    private final ProductRepository             productRepository;
    private final VariationAttributeRepository  attributeRepository;
    private final VariationAttributeValueRepository valueRepository;

    public List<ProductVariantResponse> getVariants(Long productId) {
        return variantRepository.findByProductIdOrderByPriceAsc(productId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProductVariantResponse create(Long productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (variantRepository.existsBySku(request.sku()))
            throw new IllegalArgumentException("SKU already exists: " + request.sku());

        ProductVariant variant = ProductVariant.builder()
            .product(product)
            .sku(request.sku())
            .price(request.price())
            .stock(request.stock())
            .build();

        // Attach attribute values
        if (request.attributeValueIds() != null) {
            List<VariantAttributeValue> avs = new ArrayList<>();
            for (Map.Entry<Long, Long> entry : request.attributeValueIds().entrySet()) {
                VariationAttribute attr = attributeRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Attribute", entry.getKey()));
                VariationAttributeValue val = valueRepository.findById(entry.getValue())
                    .orElseThrow(() -> new ResourceNotFoundException("AttributeValue", entry.getValue()));

                avs.add(VariantAttributeValue.builder()
                    .variant(variant)
                    .attribute(attr)
                    .value(val)
                    .build());
            }
            variant.setAttributeValues(avs);
        }

        ProductVariant saved = variantRepository.save(variant);

        // Update product base price to lowest variant price
        updateProductBasePrice(product);

        return toResponse(saved);
    }

    @Transactional
    public ProductVariantResponse updateStock(Long variantId, Integer stock) {
        ProductVariant variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));
        variant.setStock(stock);
        return toResponse(variantRepository.save(variant));
    }

    @Transactional
    public void deductStock(Long variantId, Integer quantity) {
        ProductVariant variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

        if (variant.getStock() < quantity)
            throw new IllegalArgumentException(
                "Insufficient stock for SKU: " + variant.getSku());

        variant.setStock(variant.getStock() - quantity);
        variantRepository.save(variant);
    }

    private void updateProductBasePrice(Product product) {
        variantRepository.findLowestPriceByProductId(product.getId())
            .ifPresent(price -> {
                product.setBasePrice(price);
                productRepository.save(product);
            });
    }

    public ProductVariantResponse toResponse(ProductVariant v) {
        Map<String, String> attrs = new LinkedHashMap<>();
        v.getAttributeValues().forEach(av ->
            attrs.put(av.getAttribute().getName(), av.getValue().getValue())
        );

        return new ProductVariantResponse(
            v.getId(),
            v.getSku(),
            v.getPrice(),
            v.getStock(),
            v.getIsActive(),
            v.getImageUrl(),
            v.getDisplayLabel(),
            attrs
        );
    }
}