package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository    userRepository;
    private final CartRepository    cartRepository;

    @Transactional
    public OrderResponse create(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        Order order = Order.builder()
            .user(user)
            .fullName(request.fullName())
            .phone(request.phone())
            .addressLine(request.addressLine())
            .city(request.city())
            .country(request.country())
            .paymentMethod(Order.PaymentMethod.valueOf(request.paymentMethod()))
            .notes(request.notes())
            .totalAmount(BigDecimal.ZERO)
            .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.productId()));

            if (product.getStock() < itemReq.quantity())
                throw new IllegalArgumentException(
                    "Insufficient stock for: " + product.getName() +
                    ". Available: " + product.getStock());

            // Deduct stock
            product.setStock(product.getStock() - itemReq.quantity());
            productRepository.save(product);

            BigDecimal subtotal = product.getPrice()
                .multiply(BigDecimal.valueOf(itemReq.quantity()));
            total = total.add(subtotal);

            OrderItem item = OrderItem.builder()
            .order(order)
            .product(product)
            .productName(product.getName())  // ← add this
            .quantity(itemReq.quantity())
            .unitPrice(product.getPrice())
            .build();

            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        // Clear cart after successful order
        cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        return toResponse(saved);
    }

    public List<OrderResponse> getMyOrders(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toResponse).toList();
    }

    public OrderResponse getById(Long id, String username) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Users can only see their own orders
        if (!order.getUser().getUsername().equals(username))
            throw new AccessDeniedException("Access denied");

        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(Order.Status.valueOf(status));
        return toResponse(orderRepository.save(order));
    }

    // Admin — get all orders
    public List<OrderResponse> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toResponse).toList();
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems().stream()
            .map(i -> new OrderResponse.OrderItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getQuantity(),
                i.getUnitPrice(),
                i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())) // ← subtotal
            )).toList();

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
            items,
            o.getCreatedAt()
        );
    }
}