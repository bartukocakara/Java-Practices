package com.example.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Account(
    int id,
    int userId,
    String accountNumber,
    String accountType,
    BigDecimal balance,
    String currency,
    LocalDateTime updatedAt,
    LocalDateTime createdAt
) {
    public Account deposit(BigDecimal amount) {
        return new Account(id, userId, accountNumber, accountType,
            balance.add(amount), currency, LocalDateTime.now(), createdAt);
    }

    public Account withdraw(BigDecimal amount) {
        if (balance.compareTo(amount) < 0)
            throw new IllegalArgumentException("Insufficient funds");
        return new Account(id, userId, accountNumber, accountType,
            balance.subtract(amount), currency, LocalDateTime.now(), createdAt);
    }
}