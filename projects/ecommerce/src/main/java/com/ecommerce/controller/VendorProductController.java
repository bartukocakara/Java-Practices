package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.service.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Vendor Products")
public class VendorProductController {

    private final VendorProductService vendorProductService;

    // ── Product CRUD ──

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean lowStock) {
        return ResponseEntity.ok(
            vendorProductService.getVendorProducts(
                user.getUsername(), status, lowStock));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(
            vendorProductService.getVendorProduct(user.getUsername(), id));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody VendorProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(vendorProductService.createProduct(user.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody VendorProductRequest request) {
        return ResponseEntity.ok(
            vendorProductService.updateProduct(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        vendorProductService.deleteProduct(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponse> updateStatus(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(
            vendorProductService.updateProductStatus(
                user.getUsername(), id, status));
    }

    // ── Variants ──

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantResponse>> getVariants(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            vendorProductService.getVariants(id));
    }

    @PostMapping("/{id}/variants")
    public ResponseEntity<ProductVariantResponse> addVariant(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody CreateVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(vendorProductService.addVariant(user.getUsername(), id, request));
    }

    @PutMapping("/{id}/variants/{variantId}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @PathVariable Long variantId,
            @Valid @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(
            vendorProductService.updateVariant(
                user.getUsername(), id, variantId, request));
    }

    @DeleteMapping("/{id}/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @PathVariable Long variantId) {
        vendorProductService.deleteVariant(user.getUsername(), id, variantId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/variants/{variantId}/stock")
    public ResponseEntity<ProductVariantResponse> updateVariantStock(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @PathVariable Long variantId,
            @RequestParam Integer stock) {
        return ResponseEntity.ok(
            vendorProductService.updateVariantStock(
                user.getUsername(), id, variantId, stock));
    }

    // ── Images ──

    @PostMapping("/{id}/images")
    public ResponseEntity<ProductImageResponse> uploadImage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean primary) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(vendorProductService.uploadImage(
                user.getUsername(), id, file, primary));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @PathVariable Long imageId) {
        vendorProductService.deleteImage(user.getUsername(), id, imageId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/images/{imageId}/primary")
    public ResponseEntity<Void> setPrimaryImage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @PathVariable Long imageId) {
        vendorProductService.setPrimaryImage(user.getUsername(), id, imageId);
        return ResponseEntity.noContent().build();
    }

    // ── Stats ──

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getProductStats(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(
            vendorProductService.getProductStats(user.getUsername(), id));
    }
}