package com.example.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ExchangeRate(
    String baseCurrency,
    String targetCurrency,
    BigDecimal rate,
    LocalDateTime fetchedAt
) {}