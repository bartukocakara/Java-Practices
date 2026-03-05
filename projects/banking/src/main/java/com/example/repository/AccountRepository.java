package com.example.repository;

import com.example.model.Account;
import com.example.model.User;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.math.BigDecimal;

public interface AccountRepository {

    // --- Users ---
    void createUser(String username, String email, String passwordHash) throws SQLException;
    User findByUsername(String username);
    int findUserIdByUsername(String username) throws SQLException; // ← new

    // --- Accounts ---
    Account findByOwner(String username);
    List<Account> findAllByOwner(String username);
    void createAccount(int userId, String type,
                       String accountNumber, String currency) throws SQLException;

    // --- Transactions ---
    void updateBalance(Connection conn, Account account) throws SQLException;
    void logTransaction(Connection conn, int accountId,
                        BigDecimal amount, String type) throws SQLException;
    List<String> getTransactionHistory(int accountId);
}