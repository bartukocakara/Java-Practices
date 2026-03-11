package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ReviewService reviewService;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L).username("john").email("john@test.com")
            .password("hashed").role(User.Role.ROLE_USER).build();

        testProduct = Product.builder()
            .id(1L).name("iPhone").build();
    }

    @Test
    void create_validReview_returnsResponse() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.existsByUserIdAndProductId(1L, 1L)).thenReturn(false);

        Review saved = Review.builder()
            .id(1L).user(testUser).product(testProduct)
            .rating(5).comment("Great!").build();
        when(reviewRepository.save(any())).thenReturn(saved);

        ReviewResponse response = reviewService.create("john", 1L, new ReviewRequest(5, "Great!"));

        assertEquals(5, response.rating());
        assertEquals("Great!", response.comment());
        assertEquals("john", response.username());
    }

    @Test
    void create_duplicateReview_throwsException() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.existsByUserIdAndProductId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
            () -> reviewService.create("john", 1L, new ReviewRequest(4, "Good")));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void delete_ownReview_succeeds() {
        Review review = Review.builder()
            .id(1L).user(testUser).product(testProduct).rating(5).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        reviewService.delete("john", 1L, false);

        verify(reviewRepository).delete(review);
    }

    @Test
    void delete_otherUsersReview_throwsException() {
        User otherUser = User.builder().id(2L).username("jane").build();
        Review review = Review.builder()
            .id(1L).user(otherUser).product(testProduct).rating(5).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThrows(IllegalArgumentException.class,
            () -> reviewService.delete("john", 1L, false));
        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void delete_adminDeletesAnyReview_succeeds() {
        User otherUser = User.builder().id(2L).username("jane").build();
        Review review = Review.builder()
            .id(1L).user(otherUser).product(testProduct).rating(3).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        reviewService.delete("admin", 1L, true);

        verify(reviewRepository).delete(review);
    }
}