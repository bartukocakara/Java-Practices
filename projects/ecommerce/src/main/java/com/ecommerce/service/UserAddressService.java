package com.ecommerce.service;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository        userRepository;

    private static final int MAX_ADDRESSES = 5;

    public List<AddressResponse> getAddresses(String username) {
        User user = findUser(username);
        return addressRepository
            .findByUserIdOrderByIsDefaultDescCreatedAtAsc(user.getId())
            .stream().map(this::toResponse).toList();
    }

    public AddressResponse getById(String username, Long addressId) {
        return toResponse(findAndVerify(username, addressId));
    }

    @Transactional
    public AddressResponse create(String username, AddressRequest request) {
        User user = findUser(username);

        int count = addressRepository.countByUserId(user.getId());
        if (count >= MAX_ADDRESSES)
            throw new IllegalArgumentException(
                "Maximum " + MAX_ADDRESSES + " addresses allowed");

        // If this is the first address or marked as default — set as default
        boolean makeDefault = request.isDefault() || count == 0;

        if (makeDefault)
            addressRepository.clearDefaultForUser(user.getId());

        UserAddress address = UserAddress.builder()
            .user(user)
            .title(request.title())
            .fullName(request.fullName())
            .phone(request.phone())
            .addressLine(request.addressLine())
            .city(request.city())
            .country(request.country())
            .isDefault(makeDefault)
            .build();

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(String username, Long addressId, AddressRequest request) {
        UserAddress address = findAndVerify(username, addressId);

        if (request.isDefault())
            addressRepository.clearDefaultForUser(address.getUser().getId());

        address.setTitle(request.title());
        address.setFullName(request.fullName());
        address.setPhone(request.phone());
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setCountry(request.country());
        address.setIsDefault(request.isDefault());

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse setDefault(String username, Long addressId) {
        UserAddress address = findAndVerify(username, addressId);

        addressRepository.clearDefaultForUser(address.getUser().getId());
        address.setIsDefault(true);

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void delete(String username, Long addressId) {
        UserAddress address = findAndVerify(username, addressId);
        boolean wasDefault  = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted address was default — promote the first remaining
        if (wasDefault) {
            addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtAsc(address.getUser().getId())
                .stream().findFirst()
                .ifPresent(first -> {
                    first.setIsDefault(true);
                    addressRepository.save(first);
                });
        }
    }

    // --- Helpers ---

    private UserAddress findAndVerify(String username, Long addressId) {
        User user = findUser(username);
        UserAddress address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));

        if (!address.getUser().getId().equals(user.getId()))
            throw new AccessDeniedException("Access denied");

        return address;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private AddressResponse toResponse(UserAddress a) {
        return new AddressResponse(
            a.getId(),
            a.getTitle(),
            a.getFullName(),
            a.getPhone(),
            a.getAddressLine(),
            a.getCity(),
            a.getCountry(),
            a.getIsDefault(),
            a.getCreatedAt()
        );
    }
}