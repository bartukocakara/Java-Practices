package com.example;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AccountDAO {
    private final String url = "jdbc:postgresql://localhost:5432/maven_bank";
    private final String user = "postgres";
    private final String password = "123456";

    public void save(Account account) throws SQLException {
        String sql = "UPDATE accounts SET balance = ? WHERE owner = ?";
        try (Connection conn = DriverManager.getConnection(url, user, password); 
             PreparedStatement pstmt = conn.prepareStatement(sql)){
                pstmt.setBigDecimal(1, account.balance());
                pstmt.setString(2, account.owner());
                pstmt.executeUpdate();
             }
    }

    public Account load(String owner){
        String sql = "SELECT balance FROM accounts WHERE owner = ?";
        try(Connection conn = DriverManager.getConnection(url, user, password);
            PreparedStatement pstmt = conn.prepareStatement(sql)){
                pstmt.setString(1, owner);
                ResultSet rs = pstmt.executeQuery();
                if(rs.next()){
                    return new Account(owner, rs.getBigDecimal("balance"));
                }

        } catch(SQLException e){
            System.out.println("DB Error : " + e.getMessage());
        }

        return new Account(owner, new BigDecimal("1000.00"));
    }

    public void updateBalance(Connection conn, Account account) throws SQLException {
        String sql = "UPDATE accounts SET balance = ? WHERE owner = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setBigDecimal(1, account.balance());
            pstmt.setString(2, account.owner());
            pstmt.executeUpdate();
        }
    }

    // New logic to log the transaction history
    public void logTransaction(Connection conn, String owner, BigDecimal amount, String type) throws SQLException {
        String sql = "INSERT INTO transactions (owner, amount, type) VALUES (?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, owner);
            pstmt.setBigDecimal(2, amount);
            pstmt.setString(3, type);
            pstmt.executeUpdate();
        }
    }
}
