package com.ecommerce.controller;

import com.ecommerce.dto.request.ReviewApplicationRequest;
import com.ecommerce.dto.request.UpdateStoreRequest;
import com.ecommerce.dto.request.VendorApplicationRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.service.VendorService;
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

@RestController
@RequiredArgsConstructor
@Tag(name = "Vendors")
@SecurityRequirement(name = "Bearer Auth")
public class VendorController {

    private final VendorService vendorService;

    // ── Vendor application ──

    @PostMapping("/api/vendor/apply")
    public ResponseEntity<VendorApplicationResponse> apply(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody VendorApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(vendorService.apply(user.getUsername(), request));
    }

    @GetMapping("/api/vendor/application")
    public ResponseEntity<VendorApplicationResponse> getMyApplication(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(vendorService.getMyApplication(user.getUsername()));
    }

    // ── Vendor dashboard ──

    @GetMapping("/api/vendor/dashboard")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<VendorDashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(vendorService.getDashboard(user.getUsername()));
    }

    @GetMapping("/api/vendor/store")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<VendorResponse> getMyStore(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(vendorService.getMyStore(user.getUsername()));
    }

    // ── Admin: applications ──

    @GetMapping("/api/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VendorApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(vendorService.getAllApplications());
    }

    @GetMapping("/api/admin/applications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VendorApplicationResponse>> getPendingApplications() {
        return ResponseEntity.ok(vendorService.getPendingApplications());
    }

    @PatchMapping("/api/admin/applications/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VendorApplicationResponse> reviewApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails admin,
            @Valid @RequestBody ReviewApplicationRequest request) {
        return ResponseEntity.ok(
            vendorService.reviewApplication(id, admin.getUsername(), request));
    }

    // ── Admin: vendor management ──

    @GetMapping("/api/admin/vendors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VendorResponse>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/api/admin/vendors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VendorResponse> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PatchMapping("/api/admin/vendors/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VendorResponse> updateVendorStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(vendorService.updateStatus(id, status));
    }

    @PutMapping("/api/vendor/store")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<VendorResponse> updateStore(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UpdateStoreRequest request) {
        return ResponseEntity.ok(
            vendorService.updateStore(user.getUsername(), request));
    }

    // ── Upload logo ──
    @PostMapping("/api/vendor/store/logo")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<VendorResponse> uploadLogo(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
            vendorService.uploadLogo(user.getUsername(), file));
    }

    // ── Upload banner ──
    @PostMapping("/api/vendor/store/banner")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<VendorResponse> uploadBanner(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
            vendorService.uploadBanner(user.getUsername(), file));
    }

    @GetMapping("/api/vendors/{slug}")
    public ResponseEntity<VendorResponse> getPublicVendor(
            @PathVariable String slug) {
        return ResponseEntity.ok(vendorService.getPublicVendor(slug));
    }

    @GetMapping("/api/vendors/{slug}/products")
    public ResponseEntity<List<ProductResponse>> getVendorProducts(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(
            vendorService.getPublicVendorProducts(slug, page, size));
    }
}