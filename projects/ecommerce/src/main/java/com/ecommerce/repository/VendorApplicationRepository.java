package com.ecommerce.repository;

import com.ecommerce.entity.VendorApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorApplicationRepository
        extends JpaRepository<VendorApplication, Long> {

    List<VendorApplication> findByStatusOrderByCreatedAtDesc(
            VendorApplication.Status status);

    List<VendorApplication> findAllByOrderByCreatedAtDesc();

    Optional<VendorApplication> findByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, VendorApplication.Status status);

    boolean existsByStoreSlug(String storeSlug);
}