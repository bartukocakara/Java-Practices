package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

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
}