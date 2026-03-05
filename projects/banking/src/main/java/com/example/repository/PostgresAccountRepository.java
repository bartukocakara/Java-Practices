package com.example.repository;

import com.example.config.DatabaseConfig;
import com.example.config.LoggingConfig;
import com.example.model.Account;
import com.example.model.User;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class PostgresAccountRepository implements AccountRepository {

    private static final Logger LOGGER = LoggingConfig.getLogger(PostgresAccountRepository.class);

    private Account mapRowToAccount(ResultSet rs) throws SQLException {
        return new Account(
            rs.getInt("id"),
            rs.getInt("user_id"),
            rs.getString("account_number"),
            rs.getString("account_type"),
            rs.getBigDecimal("balance"),
            rs.getString("currency"),
            rs.getTimestamp("updated_at").toLocalDateTime(),
            rs.getTimestamp("created_at").toLocalDateTime()
        );
    }

    // --- Accounts ---

    @Override
    public Account findByOwner(String username) {
        String sql = """
            SELECT a.id, a.user_id, a.account_number, a.account_type,
                   a.balance, a.currency, a.updated_at, a.created_at
            FROM accounts a
            JOIN users u ON a.user_id = u.id
            WHERE u.username = ?
            LIMIT 1
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRowToAccount(rs);
            }
        } catch (SQLException e) {
            LOGGER.severe("findByOwner failed for '" + username + "': " + e.getMessage());
        }
        return null;
    }

    @Override
    public List<Account> findAllByOwner(String username) {
        String sql = """
            SELECT a.id, a.user_id, a.account_number, a.account_type,
                   a.balance, a.currency, a.updated_at, a.created_at
            FROM accounts a
            JOIN users u ON a.user_id = u.id
            WHERE u.username = ?
            ORDER BY a.created_at ASC
            """;

        List<Account> accounts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) accounts.add(mapRowToAccount(rs));
            }
        } catch (SQLException e) {
            LOGGER.severe("findAllByOwner failed for '" + username + "': " + e.getMessage());
        }
        return accounts;
    }

    @Override
    public void createAccount(int userId, String type,
                               String accountNumber, String currency) throws SQLException {
        String sql = """
            INSERT INTO accounts (user_id, account_number, account_type, balance, currency)
            VALUES (?, ?, ?, 0.00, ?)
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setString(2, accountNumber);
            ps.setString(3, type);
            ps.setString(4, currency);
            ps.executeUpdate();

            LOGGER.info(String.format("[ACCOUNT] Created — userId: %d | type: %s | currency: %s",
                userId, type, currency));
        }
    }

    @Override
    public void updateBalance(Connection conn, Account account) throws SQLException {
        String sql = "UPDATE accounts SET balance = ?, updated_at = NOW() WHERE id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBigDecimal(1, account.balance());
            ps.setInt(2, account.id());
            ps.executeUpdate();
        }
    }

    // --- Transactions ---

    @Override
    public void logTransaction(Connection conn, int accountId,
                                BigDecimal amount, String type) throws SQLException {
        String sql = "INSERT INTO transactions (account_id, amount, transaction_type) VALUES (?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, accountId);
            ps.setBigDecimal(2, amount);
            ps.setString(3, type);
            ps.executeUpdate();
        }
    }

    @Override
    public List<String> getTransactionHistory(int accountId) {
        String sql = """
            SELECT transaction_type, amount, created_at
            FROM transactions
            WHERE account_id = ?
            ORDER BY created_at DESC
            LIMIT 10
            """;

        List<String> history = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    history.add(String.format("%-15s | %10s | %s",
                        rs.getString("transaction_type"),
                        rs.getBigDecimal("amount").toPlainString(),
                        rs.getTimestamp("created_at")));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("getTransactionHistory failed for accountId " + accountId + ": " + e.getMessage());
        }
        return history;
    }

    // --- Users ---

    @Override
    public void createUser(String username, String email, String passwordHash) throws SQLException {
        String sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.executeUpdate();

            LOGGER.info("[USER] Registered: " + username);
        }
    }

    @Override
    public int findUserIdByUsername(String username) throws SQLException {
        String sql = "SELECT id FROM users WHERE username = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("id");
                throw new SQLException("User not found: " + username);
            }
        }
    }

    @Override
    public User findByUsername(String username) {
        String sql = "SELECT id, username, email, password_hash FROM users WHERE username = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new User(
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password_hash")
                    );
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("findByUsername failed for '" + username + "': " + e.getMessage());
        }
        return null;
    }
}