package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record VendorDashboardResponse(
    // Store info
    Long vendorId,
    String storeName,
    String storeSlug,
    String status,

    // Sales stats
    BigDecimal totalRevenue,
    BigDecimal monthRevenue,
    Integer totalOrders,
    Integer pendingOrders,
    Integer totalProducts,
    Integer activeProducts,
    Integer lowStockProducts,

    // Commission
    BigDecimal commissionRate,
    BigDecimal totalCommission,
    BigDecimal netEarnings,

    // Recent orders
    List<OrderResponse> recentOrders
) {}