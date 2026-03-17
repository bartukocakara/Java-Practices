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

    private final CartRepository           cartRepository;
    private final ProductRepository        productRepository;
    private final UserRepository           userRepository;
    private final ProductVariantRepository variantRepository;

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
            .orElseThrow(() -> new ResourceNotFoundException(
                "Product", request.productId()));

        // ── Stock check ──
        ProductVariant variant = null;
        if (request.variantId() != null) {
            variant = variantRepository.findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Variant", request.variantId()));

            if (!variant.getProduct().getId().equals(request.productId()))
                throw new IllegalArgumentException(
                    "Variant does not belong to this product");

            if (variant.getStock() < request.quantity())
                throw new IllegalArgumentException(
                    "Insufficient stock for: " + product.getName()
                    + " (" + variant.getDisplayLabel() + ")");
        } else {
            if (product.getStock() < request.quantity())
                throw new IllegalArgumentException(
                    "Insufficient stock for: " + product.getName());
        }

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
            .orElseGet(() -> createEmptyCart(user));

        final ProductVariant finalVariant = variant;

        // ── Check if same product+variant already in cart ──
        cart.getItems().stream()
            .filter(i -> i.getProduct().getId().equals(request.productId())
                && variantMatches(i.getVariant(), finalVariant))
            .findFirst()
            .ifPresentOrElse(
                existing -> {
                    int newQty = existing.getQuantity() + request.quantity();
                    int availableStock = finalVariant != null
                        ? finalVariant.getStock()
                        : product.getStock();

                    if (newQty > availableStock)
                        throw new IllegalArgumentException(
                            "Cannot add " + request.quantity() + " more — only "
                            + availableStock + " in stock");

                    existing.setQuantity(newQty);
                },
                () -> cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(finalVariant)
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
            // ── Check variant stock or product stock ──
            int availableStock = item.getVariant() != null
                ? item.getVariant().getStock()
                : item.getProduct().getStock();

            if (availableStock < quantity)
                throw new IllegalArgumentException(
                    "Insufficient stock — only " + availableStock + " available");

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

    // ── Helpers ──

    private boolean variantMatches(ProductVariant a, ProductVariant b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.getId().equals(b.getId());
    }

    private Cart createEmptyCart(User user) {
        return cartRepository.save(Cart.builder().user(user).build());
    }

    private Cart getCartForUser(String username) {
        User user = findUser(username);
        return cartRepository.findByUserIdWithItems(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Cart", user.getId()));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
            .map(this::toItemResponse)
            .toList();

        BigDecimal total = itemResponses.stream()
            .map(CartResponse.CartItemResponse::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), itemResponses, total);
    }

    private CartResponse.CartItemResponse toItemResponse(CartItem item) {
        // Use variant price if variant exists, otherwise product price
        BigDecimal price = item.getVariant() != null
            ? item.getVariant().getPrice()
            : item.getProduct().getPrice();

        return new CartResponse.CartItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getVariant() != null ? item.getVariant().getId() : null,
            item.getProduct().getName(),
            item.getVariant() != null ? item.getVariant().getDisplayLabel() : null,
            price,
            item.getQuantity(),
            price.multiply(BigDecimal.valueOf(item.getQuantity()))
        );
    }
}