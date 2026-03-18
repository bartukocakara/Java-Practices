package com.ecommerce.service;

import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorOrderService {

    private final OrderRepository   orderRepository;
    private final VendorRepository  vendorRepository;
    private final UserRepository    userRepository;
    private final ProductRepository productRepository;

    // ── Get all orders containing vendor's products ──
    public List<OrderResponse> getVendorOrders(String username, String status) {
        Vendor vendor = findVendor(username);

        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(o -> hasVendorItems(o, vendor.getId()))
            .filter(o -> status == null ||
                o.getStatus().name().equalsIgnoreCase(status))
            .map(o -> toVendorOrderResponse(o, vendor.getId()))
            .toList();
    }

    // ── Get single order ──
    public OrderResponse getVendorOrder(String username, Long orderId) {
        Vendor vendor = findVendor(username);
        Order  order  = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!hasVendorItems(order, vendor.getId()))
            throw new AccessDeniedException(
                "This order does not contain your products");

        return toVendorOrderResponse(order, vendor.getId());
    }

    // ── Update order status ──
    @Transactional
    public OrderResponse updateOrderStatus(String username,
                                            Long orderId,
                                            String status) {
        Vendor vendor = findVendor(username);
        Order  order  = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!hasVendorItems(order, vendor.getId()))
            throw new AccessDeniedException(
                "This order does not contain your products");

        // Validate allowed transitions
        Order.Status newStatus = Order.Status.valueOf(status.toUpperCase());
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return toVendorOrderResponse(orderRepository.save(order), vendor.getId());
    }

    // ── Stats ──
    public Map<String, Object> getOrderStats(String username) {
        Vendor vendor = findVendor(username);

        List<Order> vendorOrders = orderRepository
            .findAllByOrderByCreatedAtDesc().stream()
            .filter(o -> hasVendorItems(o, vendor.getId()))
            .toList();

        long pending   = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.PENDING).count();
        long confirmed = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.CONFIRMED).count();
        long shipped   = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.SHIPPED).count();
        long delivered = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED).count();
        long cancelled = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.CANCELLED).count();

        BigDecimal totalRevenue = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED)
            .flatMap(o -> o.getItems().stream())
            .filter(i -> isVendorProduct(i, vendor.getId()))
            .map(i -> i.getUnitPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Month revenue
        LocalDateTime monthStart = LocalDateTime.now()
            .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthRevenue = vendorOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.DELIVERED
                && o.getCreatedAt().isAfter(monthStart))
            .flatMap(o -> o.getItems().stream())
            .filter(i -> isVendorProduct(i, vendor.getId()))
            .map(i -> i.getUnitPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total",        vendorOrders.size());
        stats.put("pending",      pending);
        stats.put("confirmed",    confirmed);
        stats.put("shipped",      shipped);
        stats.put("delivered",    delivered);
        stats.put("cancelled",    cancelled);
        stats.put("totalRevenue", totalRevenue);
        stats.put("monthRevenue", monthRevenue);
        return stats;
    }

    // ── Helpers ──
    private boolean hasVendorItems(Order order, Long vendorId) {
        return order.getItems().stream()
            .anyMatch(i -> isVendorProduct(i, vendorId));
    }

    private boolean isVendorProduct(OrderItem item, Long vendorId) {
        return productRepository.findById(item.getProduct().getId())
            .map(p -> vendorId.equals(p.getVendorId()))
            .orElse(false);
    }

    private void validateStatusTransition(Order.Status current,
                                           Order.Status next) {
        Map<Order.Status, Set<Order.Status>> allowed = Map.of(
            Order.Status.PENDING,   Set.of(Order.Status.CONFIRMED,
                                            Order.Status.CANCELLED),
            Order.Status.CONFIRMED, Set.of(Order.Status.SHIPPED,
                                            Order.Status.CANCELLED),
            Order.Status.SHIPPED,   Set.of(Order.Status.DELIVERED),
            Order.Status.DELIVERED, Set.of(),
            Order.Status.CANCELLED, Set.of()
        );

        if (!allowed.getOrDefault(current, Set.of()).contains(next))
            throw new IllegalArgumentException(
                "Cannot transition from " + current + " to " + next);
    }

    private Vendor findVendor(String username) {
        return userRepository.findByUsername(username)
            .map(u -> vendorRepository.findByUserId(u.getId())
                .orElseThrow(() ->
                    new AccessDeniedException("Not a vendor")))
            .orElseThrow(() ->
                new ResourceNotFoundException("User", 0L));
    }

    private OrderResponse toVendorOrderResponse(Order order, Long vendorId) {
        List<OrderItemResponse> items = order.getItems().stream()
            .filter(i -> isVendorProduct(i, vendorId))
            .map(i -> new OrderItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProductName(),
                i.getVariant() != null ? i.getVariant().getId() : null,
                i.getVariantInfo(),
                i.getQuantity(),
                i.getUnitPrice(),
                i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
            )).toList();

        BigDecimal vendorSubtotal = items.stream()
            .map(OrderItemResponse::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
            order.getId(),
            order.getStatus().name(),
            order.getPaymentMethod().name(),
            vendorSubtotal,
            order.getFullName(),
            order.getPhone(),
            order.getAddressLine(),
            order.getCity(),
            order.getCountry(),
            order.getNotes(),
            items,
            order.getCreatedAt()
        );
    }
}