package com.example;

import java.math.BigDecimal;

public record Account(String owner, BigDecimal balance) {
    public Account deposit(BigDecimal amount) {
        return new Account(owner, balance.add(amount));
    }

    public Account withdraw(BigDecimal amount){
        if(amount.compareTo(balance) > 0 ) throw new IllegalArgumentException("Insufficient funds");
        return new Account(owner, balance.subtract(amount));
    }
}
