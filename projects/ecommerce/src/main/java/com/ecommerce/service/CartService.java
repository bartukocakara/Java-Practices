package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
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
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartResponse getCart(String username) {
        User user = findUser(username);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
            .orElseGet(() -> createEmptyCart(user));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String username, CartItemRequest request) {
        User user = findUser(username);
        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));

        if (product.getStock() < request.quantity())
            throw new IllegalArgumentException("Insufficient stock for: " + product.getName());

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
            .orElseGet(() -> createEmptyCart(user));

        // Update quantity if item already exists, otherwise add new
        cart.getItems().stream()
            .filter(i -> i.getProduct().getId().equals(request.productId()))
            .findFirst()
            .ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + request.quantity()),
                () -> cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build())
            );

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(String username, Long cartItemId, Integer quantity) {
        Cart cart = getCartForUser(username);

        CartItem item = cart.getItems().stream()
            .filter(i -> i.getId().equals(cartItemId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (item.getProduct().getStock() < quantity)
                throw new IllegalArgumentException("Insufficient stock");
            item.setQuantity(quantity);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(String username, Long cartItemId) {
        Cart cart = getCartForUser(username);
        cart.getItems().removeIf(i -> i.getId().equals(cartItemId));
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(String username) {
        Cart cart = getCartForUser(username);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // --- Helpers ---

    private Cart createEmptyCart(User user) {
        return cartRepository.save(Cart.builder().user(user).build());
    }

    private Cart getCartForUser(String username) {
        User user = findUser(username);
        return cartRepository.findByUserIdWithItems(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart", user.getId()));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
            .map(i -> new CartResponse.CartItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getProduct().getPrice(),
                i.getQuantity(),
                i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
            )).toList();

        BigDecimal total = itemResponses.stream()
            .map(CartResponse.CartItemResponse::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), itemResponses, total);
    }
}