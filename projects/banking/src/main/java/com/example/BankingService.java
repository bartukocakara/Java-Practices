package com.example;

import java.math.BigDecimal;

public class BankingService {
    private Account account;
    private final AccountDAO dao;

    public BankingService(String owner){
        this.dao = new AccountDAO();
        this.account = dao.load(owner);
    }

    public void deposit(BigDecimal amount) throws Exception {
        this.account = account.deposit(amount);
        dao.save(account);
    }

    public void withdraw(BigDecimal amount) throws Exception {
        this.account = account.withdraw(amount);
        dao.save(account);
    }

    public BigDecimal getBalance(){
        return account.balance();
    }
}
