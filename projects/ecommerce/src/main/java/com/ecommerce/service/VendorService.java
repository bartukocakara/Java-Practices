package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewApplicationRequest;
import com.ecommerce.dto.request.VendorApplicationRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorService {

    private final VendorRepository            vendorRepository;
    private final VendorApplicationRepository applicationRepository;
    private final UserRepository              userRepository;
    private final OrderRepository             orderRepository;
    private final ProductRepository           productRepository;
    private final SlugService                 slugService;

    // ── Application flow ──

    @Transactional
    public VendorApplicationResponse apply(String username,
                                           VendorApplicationRequest request) {
        User user = findUser(username);

        // Check not already a vendor
        if (vendorRepository.findByUserId(user.getId()).isPresent())
            throw new IllegalArgumentException("You are already a vendor");

        // Check no pending application
        if (applicationRepository.existsByUserIdAndStatus(
                user.getId(), VendorApplication.Status.PENDING))
            throw new IllegalArgumentException(
                "You already have a pending application");

        // Generate unique slug
        String slug = generateUniqueSlug(request.storeName());

        VendorApplication app = VendorApplication.builder()
            .user(user)
            .storeName(request.storeName())
            .storeSlug(slug)
            .description(request.description())
            .email(request.email())
            .phone(request.phone())
            .address(request.address())
            .build();

        return toApplicationResponse(applicationRepository.save(app));
    }

    public VendorApplicationResponse getMyApplication(String username) {
        User user = findUser(username);
        VendorApplication app = applicationRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Application", 0L));
        return toApplicationResponse(app);
    }

    // ── Admin: review applications ──

    public List<VendorApplicationResponse> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toApplicationResponse).toList();
    }

    public List<VendorApplicationResponse> getPendingApplications() {
        return applicationRepository
            .findByStatusOrderByCreatedAtDesc(VendorApplication.Status.PENDING)
            .stream().map(this::toApplicationResponse).toList();
    }

    @Transactional
    public VendorApplicationResponse reviewApplication(Long applicationId,
                                                        String adminUsername,
                                                        ReviewApplicationRequest request) {
        User admin = findUser(adminUsername);
        VendorApplication app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        if (app.getStatus() != VendorApplication.Status.PENDING)
            throw new IllegalArgumentException("Application already reviewed");

        VendorApplication.Status decision =
            VendorApplication.Status.valueOf(request.decision().toUpperCase());

        app.setStatus(decision);
        app.setAdminNote(request.adminNote());
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(admin);

        applicationRepository.save(app);

        // If approved — create vendor account + update user role
        if (decision == VendorApplication.Status.APPROVED) {
            createVendorFromApplication(app);
        }

        return toApplicationResponse(app);
    }

    // ── Vendor management ──

    public VendorDashboardResponse getDashboard(String username) {
        User user   = findUser(username);
        Vendor vendor = findVendorByUser(user.getId());

        // Revenue calculations
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        // Filter orders containing this vendor's products
        List<Order> vendorOrders = allOrders.stream()
            .filter(o -> o.getItems().stream()
                .anyMatch(i -> {
                    var product = productRepository.findById(i.getProduct().getId());
                    return product.isPresent() &&
                           vendor.getId().equals(product.get().getVendorId());
                }))
            .toList();

        BigDecimal totalRevenue = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED)
            .flatMap(o -> o.getItems().stream())
            .filter(i -> {
                var product = productRepository.findById(i.getProduct().getId());
                return product.isPresent() &&
                       vendor.getId().equals(product.get().getVendorId());
            })
            .map(i -> i.getUnitPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Month revenue
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1)
            .withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthRevenue = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED
                && o.getCreatedAt().isAfter(monthStart))
            .flatMap(o -> o.getItems().stream())
            .filter(i -> {
                var product = productRepository.findById(i.getProduct().getId());
                return product.isPresent() &&
                       vendor.getId().equals(product.get().getVendorId());
            })
            .map(i -> i.getUnitPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.PENDING
                || o.getStatus() == Order.Status.CONFIRMED)
            .count();

        Integer totalProducts   = productRepository.countByVendorId(vendor.getId());
        Integer activeProducts  = vendorRepository.countActiveProducts(vendor.getId());
        Integer lowStock        = vendorRepository.countLowStockProducts(vendor.getId());

        BigDecimal commission = totalRevenue
            .multiply(vendor.getCommissionRate())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netEarnings = totalRevenue.subtract(commission);

        // Recent 5 orders
        List<OrderResponse> recentOrders = vendorOrders.stream()
            .limit(5)
            .map(this::toOrderResponse)
            .toList();

        return new VendorDashboardResponse(
            vendor.getId(),
            vendor.getStoreName(),
            vendor.getStoreSlug(),
            vendor.getStatus().name(),
            totalRevenue,
            monthRevenue,
            vendorOrders.size(),
            (int) pendingOrders,
            totalProducts,
            activeProducts,
            lowStock,
            vendor.getCommissionRate(),
            commission,
            netEarnings,
            recentOrders
        );
    }

    public VendorResponse getMyStore(String username) {
        User user = findUser(username);
        return toVendorResponse(findVendorByUser(user.getId()));
    }

    // ── Admin: vendor management ──

    public List<VendorResponse> getAllVendors() {
        return vendorRepository.findAll()
            .stream().map(this::toVendorResponse).toList();
    }

    public VendorResponse getVendorById(Long vendorId) {
        return toVendorResponse(vendorRepository.findById(vendorId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", vendorId)));
    }

    @Transactional
    public VendorResponse updateStatus(Long vendorId, String status) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", vendorId));
        vendor.setStatus(Vendor.Status.valueOf(status.toUpperCase()));
        return toVendorResponse(vendorRepository.save(vendor));
    }

    // ── Helpers ──

    private void createVendorFromApplication(VendorApplication app) {
        User user = app.getUser();

        Vendor vendor = Vendor.builder()
            .user(user)
            .storeName(app.getStoreName())
            .storeSlug(app.getStoreSlug())
            .description(app.getDescription())
            .email(app.getEmail())
            .phone(app.getPhone())
            .address(app.getAddress())
            .status(Vendor.Status.ACTIVE)
            .commissionRate(new BigDecimal("10.00"))
            .build();

        vendorRepository.save(vendor);

        // Promote user role to ROLE_VENDOR
        user.setRole(User.Role.ROLE_VENDOR);
        userRepository.save(user);

        log.info("Vendor created: {} for user: {}",
            vendor.getStoreName(), user.getUsername());
    }

    private String generateUniqueSlug(String storeName) {
        String base = storeName.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-");

        String slug = base;
        int counter = 1;
        while (applicationRepository.existsByStoreSlug(slug)
            || vendorRepository.existsByStoreSlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private Vendor findVendorByUser(Long userId) {
        return vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new AccessDeniedException(
                "You are not a registered vendor"));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private VendorApplicationResponse toApplicationResponse(VendorApplication a) {
        return new VendorApplicationResponse(
            a.getId(),
            a.getStoreName(),
            a.getStoreSlug(),
            a.getDescription(),
            a.getEmail(),
            a.getPhone(),
            a.getAddress(),
            a.getStatus().name(),
            a.getAdminNote(),
            a.getUser().getUsername(),
            a.getCreatedAt(),
            a.getReviewedAt()
        );
    }

    private VendorResponse toVendorResponse(Vendor v) {
        return new VendorResponse(
            v.getId(),
            v.getStoreName(),
            v.getStoreSlug(),
            v.getDescription(),
            v.getLogoUrl(),
            v.getBannerUrl(),
            v.getEmail(),
            v.getPhone(),
            v.getStatus().name(),
            v.getCommissionRate(),
            v.getTotalSales(),
            v.getRating(),
            v.getUser().getUsername(),
            v.getCreatedAt()
        );
    }

    private OrderResponse toOrderResponse(Order o) {
        return new OrderResponse(
            o.getId(),
            o.getStatus().name(),
            o.getPaymentMethod().name(),
            o.getTotalAmount(),
            o.getFullName(),
            o.getPhone(),
            o.getAddressLine(),
            o.getCity(),
            o.getCountry(),
            o.getNotes(),
            List.of(),
            o.getCreatedAt()
        );
    }
}