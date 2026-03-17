package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {

    private final ProductService    productService;
    private final OrderRepository   orderRepository;
    private final ReviewRepository  reviewRepository;   // ← add
    private final UserRepository    userRepository;     // ← add

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String direction) {
        return ResponseEntity.ok(productService.getAll(page, size, sortBy, direction));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filter(
            @RequestParam(required = false)      Long       categoryId,
            @RequestParam(required = false)      BigDecimal minPrice,
            @RequestParam(required = false)      BigDecimal maxPrice,
            @RequestParam(required = false)      String     name,
            @RequestParam(defaultValue = "0")    int        page,
            @RequestParam(defaultValue = "10")   int        size,
            @RequestParam(defaultValue = "name") String     sortBy,
            @RequestParam(defaultValue = "asc")  String     direction) {
        return ResponseEntity.ok(
            productService.filter(categoryId, minPrice, maxPrice,
                                  name, page, size, sortBy, direction));
    }

    @GetMapping("/{slugOrId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String slugOrId) {
        try {
            Long id = Long.parseLong(slugOrId);
            return ResponseEntity.ok(productService.getById(id));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(productService.getBySlug(slugOrId));
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam String name) {
        return ResponseEntity.ok(productService.search(name));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Review eligibility check ──
    @GetMapping("/{id}/reviews/can-review")
    public ResponseEntity<Map<String, Object>> canReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.ok(Map.of(
                "canReview", false,
                "reason",    "NOT_AUTHENTICATED"
            ));
        }

        Long userId = userRepository
            .findByUsername(userDetails.getUsername())
            .orElseThrow()
            .getId();

        boolean hasPurchased = orderRepository
            .existsByUserIdAndStatusAndItemsProductId(
                userId,
                Order.Status.DELIVERED,
                id
            );

        boolean alreadyReviewed = reviewRepository
            .existsByUserIdAndProductId(userId, id);

        String reason = !hasPurchased   ? "NOT_PURCHASED"
                      : alreadyReviewed ? "ALREADY_REVIEWED"
                      :                   "OK";

        return ResponseEntity.ok(Map.of(
            "canReview",       "OK".equals(reason),
            "reason",          reason,
            "hasPurchased",    hasPurchased,
            "alreadyReviewed", alreadyReviewed
        ));
    }
}