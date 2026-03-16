package com.ecommerce.controller;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.service.UserAddressService;
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
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses")
@SecurityRequirement(name = "Bearer Auth")
public class UserAddressController {

    private final UserAddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(addressService.getAddresses(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getById(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.getById(user.getUsername(), id));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(addressService.create(user.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.update(user.getUsername(), id, request));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefault(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefault(user.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        addressService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}