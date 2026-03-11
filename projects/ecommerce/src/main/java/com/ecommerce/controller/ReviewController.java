package com.ecommerce.controller;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.service.ReviewService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getByProduct(productId));
    }

    @GetMapping("/rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAverageRating(productId));
    }

    @PostMapping
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<ReviewResponse> create(@PathVariable Long productId,
                                                  @AuthenticationPrincipal UserDetails user,
                                                  @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reviewService.create(user.getUsername(), productId, request));
    }

    @PutMapping("/{reviewId}")
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<ReviewResponse> update(@PathVariable Long productId,
                                                  @PathVariable Long reviewId,
                                                  @AuthenticationPrincipal UserDetails user,
                                                  @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.update(user.getUsername(), reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    @SecurityRequirement(name = "Bearer Auth")
    public ResponseEntity<Void> delete(@PathVariable Long productId,
                                        @PathVariable Long reviewId,
                                        @AuthenticationPrincipal UserDetails user) {
        boolean isAdmin = user.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.delete(user.getUsername(), reviewId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}