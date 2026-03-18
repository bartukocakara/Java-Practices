package com.ecommerce.controller;

import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.service.VendorOrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Vendor Orders")
public class VendorOrderController {

    private final VendorOrderService vendorOrderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
            vendorOrderService.getVendorOrders(user.getUsername(), status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(
            vendorOrderService.getVendorOrder(user.getUsername(), orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(
            vendorOrderService.updateOrderStatus(
                user.getUsername(), orderId, status));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            vendorOrderService.getOrderStats(user.getUsername()));
    }
}