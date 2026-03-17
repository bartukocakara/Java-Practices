package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public List<ReviewResponse> getByProduct(Long productId) {
        if (!productRepository.existsById(productId))
            throw new ResourceNotFoundException("Product", productId);
        return reviewRepository.findByProductId(productId)
            .stream().map(this::toResponse).toList();
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.findAverageRatingByProductId(productId);
    }

    @Transactional
    public ReviewResponse create(String username, Long productId, ReviewRequest request) {
        User user = findUser(username);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId))
            throw new IllegalArgumentException("You have already reviewed this product");

        Review review = Review.builder()
            .user(user)
            .product(product)
            .rating(request.rating())
            .comment(request.comment())
            .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse update(String username, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getUsername().equals(username))
            throw new IllegalArgumentException("You can only edit your own reviews");

        review.setRating(request.rating());
        review.setComment(request.comment());
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(String username, Long reviewId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!isAdmin && !review.getUser().getUsername().equals(username))
            throw new IllegalArgumentException("You can only delete your own reviews");

        reviewRepository.delete(review);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
            r.getId(),
            r.getUser().getUsername(),
            r.getRating(),
            r.getComment(),
            r.getCreatedAt()
        );
    }

    @Transactional
    public ReviewResponse submitReview(String username, Long productId,
                                        ReviewRequest request) {
        User user = findUser(username);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        // ── Check: has the user purchased this product? ──
        boolean hasPurchased = orderRepository
            .existsByUserIdAndStatusAndItemsProductId(
                user.getId(),
                Order.Status.DELIVERED,
                productId
            );

        if (!hasPurchased) {
            throw new IllegalArgumentException(
                "You can only review products you have purchased and received");
        }

        // ── Check: already reviewed? ──
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new IllegalArgumentException(
                "You have already reviewed this product");
        }

        Review review = Review.builder()
            .user(user)
            .product(product)
            .rating(request.rating())
            .comment(request.comment())
            .build();

        Review saved = reviewRepository.save(review);
        updateProductRating(product);
        return toResponse(saved);
    }

    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());

        if (reviews.isEmpty()) {
            product.setAverageRating(0.0);
            product.setReviewCount(0);
        } else {
            double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

            // Round to 1 decimal place
            double rounded = Math.round(avg * 10.0) / 10.0;

            product.setAverageRating(rounded);
            product.setReviewCount(reviews.size());
        }

        productRepository.save(product);
    }

    @Transactional
    public void deleteReview(String username, Long reviewId) {
        User user     = findUser(username);
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId()))
            throw new AccessDeniedException("Access denied");

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate after deletion
        updateProductRating(product);
    }
}