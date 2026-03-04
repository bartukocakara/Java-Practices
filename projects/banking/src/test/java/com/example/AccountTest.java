package com.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

public class AccountTest {
    @Test
    void testDeposit(){
        Account account = new Account("Kocakara", new BigDecimal("1000.00"));
        Account updated = account.deposit(new BigDecimal("500.00"));

        assertEquals(new BigDecimal("1500.00"), updated.balance(), "Balance Should increase after deposit");
    }

    @Test
    void testWithdrawSuccess() {
        Account account = new Account("Kocakara", new BigDecimal("1000.00"));
        Account updated = account.withdraw(new BigDecimal("400.00"));
        
        assertEquals(new BigDecimal("600.00"), updated.balance());
    }

    @Test
    void testWithdrawInsufficientFunds() {
        Account account = new Account("Kocakara", new BigDecimal("100.00"));
        
        // This ensures our logic correctly throws an error if someone tries to overdraw
        assertThrows(IllegalArgumentException.class, () -> {
            account.withdraw(new BigDecimal("200.00"));
        });
    }
}
