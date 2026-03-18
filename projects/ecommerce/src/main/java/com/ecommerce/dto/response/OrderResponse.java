package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long                    id,
    String                  status,
    String                  paymentMethod,
    BigDecimal              totalAmount,
    String                  fullName,
    String                  phone,
    String                  addressLine,
    String                  city,
    String                  country,
    String                  notes,
    List<OrderItemResponse> items,
    LocalDateTime           createdAt
) {}