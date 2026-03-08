package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public OrderResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public OrderResponse create(OrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        List<OrderItem> items = request.items().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.productId()));

            if (product.getStock() < itemReq.quantity())
                throw new IllegalArgumentException("Insufficient stock for: " + product.getName());

            product.setStock(product.getStock() - itemReq.quantity());
            productRepository.save(product);

            return OrderItem.builder()
                .product(product)
                .quantity(itemReq.quantity())
                .unitPrice(product.getPrice())
                .build();
        }).toList();

        BigDecimal total = items.stream()
            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
            .user(user)
            .items(items)
            .totalAmount(total)
            .build();

        // Link items back to order
        items.forEach(item -> item.setOrder(order));

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, Order.Status status) {
        Order order = findOrThrow(id);
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    public void delete(Long id) {
        orderRepository.delete(findOrThrow(id));
    }

    private Order findOrThrow(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> itemResponses = o.getItems().stream()
            .map(i -> new OrderResponse.OrderItemResponse(
                i.getProduct().getName(), i.getQuantity(), i.getUnitPrice()))
            .toList();
        return new OrderResponse(o.getId(), o.getStatus().name(),
            o.getTotalAmount(), o.getCreatedAt(), itemResponses);
    }
}