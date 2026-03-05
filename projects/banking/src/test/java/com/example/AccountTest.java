package com.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import com.example.model.Account;

public class AccountTest {

    private Account createBaseAccount(BigDecimal balance) {
        return new Account(
            1,
            1,                   // userId (int) — was String "bkckr" before
            "TR1234567890",
            "CHECKING",
            balance,
            "TRY",
            LocalDateTime.now(), // updatedAt
            LocalDateTime.now()  // createdAt
        );
    }

    @Test
    void testDeposit() {
        Account account = createBaseAccount(new BigDecimal("1000.00"));
        Account updated = account.deposit(new BigDecimal("500.00"));

        assertEquals(new BigDecimal("1500.00"), updated.balance(), "Balance should increase after deposit");
        assertEquals("TRY", updated.currency());
        assertEquals("CHECKING", updated.accountType());
    }

    @Test
    void testWithdrawSuccess() {
        Account account = createBaseAccount(new BigDecimal("1000.00"));
        Account updated = account.withdraw(new BigDecimal("400.00"));

        assertEquals(new BigDecimal("600.00"), updated.balance());
    }

    @Test
    void testWithdrawInsufficientFunds() {
        Account account = createBaseAccount(new BigDecimal("100.00"));

        assertThrows(IllegalArgumentException.class, () ->
            account.withdraw(new BigDecimal("200.00"))
        );
    }
}