package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartRepository            cartRepository;
    @Mock ProductRepository         productRepository;
    @Mock UserRepository            userRepository;
    @Mock ProductVariantRepository  variantRepository; // ← add

    @InjectMocks CartService cartService;

    private User    testUser;
    private Product testProduct;
    private Cart    testCart;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L).username("john").email("john@test.com")
            .password("hashed").role(User.Role.ROLE_USER).build();

        testProduct = Product.builder()
            .id(1L).name("iPhone")
            .price(new BigDecimal("999.99"))
            .stock(10)
            .variants(new java.util.HashSet<>())  // ← empty variants = no variant required
            .build();

        testCart = Cart.builder()
            .id(1L).user(testUser).items(new ArrayList<>()).build();
    }

    @Test
    void getCart_existingCart_returnsCartResponse() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));

        CartResponse response = cartService.getCart("john");

        assertNotNull(response);
        assertEquals(0, response.items().size());
        assertEquals(BigDecimal.ZERO, response.totalAmount());
    }

    @Test
    void getCart_noExistingCart_createsNewCart() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any())).thenReturn(testCart);

        CartResponse response = cartService.getCart("john");

        assertNotNull(response);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void addItem_validProduct_noVariant_addsToCart() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any())).thenReturn(testCart);

        // null variantId — simple product
        CartItemRequest request = new CartItemRequest(1L, null, 2);
        CartResponse response = cartService.addItem("john", request);

        assertNotNull(response);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addItem_withVariant_addsToCart() {
        ProductVariant variant = ProductVariant.builder()
            .id(10L)
            .product(testProduct)
            .sku("IPH-BLK-128")
            .price(new BigDecimal("999.99"))
            .stock(5)
            .isActive(true)
            .build();

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(10L)).thenReturn(Optional.of(variant));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any())).thenReturn(testCart);

        CartItemRequest request = new CartItemRequest(1L, 10L, 2);
        CartResponse response = cartService.addItem("john", request);

        assertNotNull(response);
        verify(variantRepository).findById(10L);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addItem_insufficientProductStock_throwsException() {
        testProduct.setStock(1);
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        CartItemRequest request = new CartItemRequest(1L, null, 5);

        assertThrows(IllegalArgumentException.class,
            () -> cartService.addItem("john", request));
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addItem_insufficientVariantStock_throwsException() {
        ProductVariant variant = ProductVariant.builder()
            .id(10L)
            .product(testProduct)
            .sku("IPH-BLK-128")
            .price(new BigDecimal("999.99"))
            .stock(2)
            .isActive(true)
            .build();

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(10L)).thenReturn(Optional.of(variant));

        CartItemRequest request = new CartItemRequest(1L, 10L, 5);

        assertThrows(IllegalArgumentException.class,
            () -> cartService.addItem("john", request));
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addItem_productNotFound_throwsException() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> cartService.addItem("john", new CartItemRequest(99L, null, 1)));
    }

    @Test
    void addItem_variantNotFound_throwsException() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> cartService.addItem("john", new CartItemRequest(1L, 99L, 1)));
    }

    @Test
    void addItem_sameProductVariant_incrementsQuantity() {
        ProductVariant variant = ProductVariant.builder()
            .id(10L).product(testProduct).sku("IPH-BLK-128")
            .price(new BigDecimal("999.99")).stock(20).isActive(true).build();

        CartItem existing = CartItem.builder()
            .id(1L).cart(testCart).product(testProduct)
            .variant(variant).quantity(3).build();
        testCart.getItems().add(existing);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(10L)).thenReturn(Optional.of(variant));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any())).thenReturn(testCart);

        CartItemRequest request = new CartItemRequest(1L, 10L, 2);
        cartService.addItem("john", request);

        // Quantity should be 3 + 2 = 5
        assertEquals(5, existing.getQuantity());
        verify(cartRepository).save(testCart);
    }

    @Test
    void clearCart_removesAllItems() {
        CartItem item = CartItem.builder()
            .id(1L).cart(testCart).product(testProduct).quantity(2).build();
        testCart.getItems().add(item);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any())).thenReturn(testCart);

        cartService.clearCart("john");

        assertEquals(0, testCart.getItems().size());
        verify(cartRepository).save(testCart);
    }

    @Test
    void removeItem_existingItem_removesIt() {
        CartItem item = CartItem.builder()
            .id(1L).cart(testCart).product(testProduct).quantity(2).build();
        testCart.getItems().add(item);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any())).thenReturn(testCart);

        cartService.removeItem("john", 1L);

        assertEquals(0, testCart.getItems().size());
        verify(cartRepository).save(testCart);
    }
}