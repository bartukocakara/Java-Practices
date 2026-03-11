package com.ecommerce.repository;

import com.ecommerce.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ReviewRepositoryTest {

    @Autowired ReviewRepository reviewRepository;
    @Autowired UserRepository userRepository;
    @Autowired ProductRepository productRepository;
    @Autowired CategoryRepository categoryRepository;

    private User savedUser() {
        return userRepository.save(User.builder()
            .username("john").email("john@test.com")
            .password("hashed").role(User.Role.ROLE_USER).build());
    }

    private Product savedProduct() {
        Category cat = categoryRepository.save(
            Category.builder().name("Electronics").build());
        return productRepository.save(Product.builder()
            .name("iPhone").price(new BigDecimal("999")).stock(10)
            .category(cat).build());
    }

    @Test
    void save_andFindByProductId_returnsReview() {
        User user = savedUser();
        Product product = savedProduct();

        reviewRepository.save(Review.builder()
            .user(user).product(product).rating(5).comment("Great!").build());

        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        assertEquals(1, reviews.size());
        assertEquals(5, reviews.get(0).getRating());
    }

    @Test
    void existsByUserIdAndProductId_returnsTrueWhenExists() {
        User user = savedUser();
        Product product = savedProduct();

        reviewRepository.save(Review.builder()
            .user(user).product(product).rating(4).build());

        assertTrue(reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId()));
        assertFalse(reviewRepository.existsByUserIdAndProductId(999L, product.getId()));
    }

    @Test
    void findAverageRating_multipleReviews_returnsCorrectAverage() {
        User user1 = userRepository.save(User.builder()
            .username("u1").email("u1@test.com")
            .password("h").role(User.Role.ROLE_USER).build());
        User user2 = userRepository.save(User.builder()
            .username("u2").email("u2@test.com")
            .password("h").role(User.Role.ROLE_USER).build());
        Product product = savedProduct();

        reviewRepository.save(Review.builder().user(user1).product(product).rating(4).build());
        reviewRepository.save(Review.builder().user(user2).product(product).rating(2).build());

        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        assertEquals(3.0, avg, 0.01);
    }

    @Test
    void findByUserIdAndProductId_returnsReview() {
        User user = savedUser();
        Product product = savedProduct();

        reviewRepository.save(Review.builder()
            .user(user).product(product).rating(5).comment("Excellent").build());

        Optional<Review> found = reviewRepository
            .findByUserIdAndProductId(user.getId(), product.getId());
        assertTrue(found.isPresent());
        assertEquals("Excellent", found.get().getComment());
    }
}