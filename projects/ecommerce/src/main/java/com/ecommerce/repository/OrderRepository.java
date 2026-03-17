package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT COUNT(o) > 0 FROM Order o
        JOIN o.items i
        WHERE o.user.id   = :userId
        AND   o.status    = :status
        AND   i.product.id = :productId
        """)
    boolean existsByUserIdAndStatusAndItemsProductId(
        @Param("userId")    Long userId,
        @Param("status")    Order.Status status,
        @Param("productId") Long productId
    );
}