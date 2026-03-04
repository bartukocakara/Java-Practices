package com.example;

import io.github.cdimascio.dotenv.Dotenv;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.*;
import java.io.IOException;

public class BankingService {
    private Account account;
    private final AccountDAO dao;
    
    // Environment variables
    private final String url;
    private final String user;
    private final String pass;

    // Fix: Declare the LOGGER properly
    private static final Logger LOGGER = Logger.getLogger(BankingService.class.getName());

    static {
        try {
            FileHandler fileHandler = new FileHandler("banking_system.log", true);
            fileHandler.setFormatter(new SimpleFormatter());
            LOGGER.addHandler(fileHandler);
            LOGGER.setLevel(Level.ALL);
        } catch (IOException e) {
            System.err.println("Could not initialize log file: " + e.getMessage());
        }
    }

    // Single Merged Constructor
    public BankingService(String owner) {
        Dotenv dotenv = Dotenv.load();
        
        this.url = String.format("jdbc:postgresql://%s:%s/%s",
                dotenv.get("FU_MAIN_DB_HOST"),
                dotenv.get("FU_MAIN_DB_PORT"),
                dotenv.get("FU_MAIN_DB_NAME"));
        
        this.user = dotenv.get("FU_MAIN_DB_USERNAME");
        this.pass = dotenv.get("FU_MAIN_DB_PASSWORD");

        this.dao = new AccountDAO();
        
        // Pass the credentials to your DAO load method if needed, 
        // or ensure DAO uses the same environment logic.
        this.account = dao.load(owner); 
    }

    public void deposit(BigDecimal amount) throws Exception {
        executeTransaction(amount, "DEPOSIT");
    }

    public void withdraw(BigDecimal amount) throws Exception {
        executeTransaction(amount, "WITHDRAWAL");
    }

    private void executeTransaction(BigDecimal amount, String type) throws Exception {
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            try {
                conn.setAutoCommit(false); 

                Account pendingAccount = type.equals("DEPOSIT") 
                    ? account.deposit(amount) 
                    : account.withdraw(amount);

                dao.updateBalance(conn, pendingAccount);
                dao.logTransaction(conn, pendingAccount.owner(), amount, type);

                conn.commit(); 

                this.account = pendingAccount; 
                LOGGER.info("Successfully committed " + type + " to database.");

            } catch (Exception e) {
                if (conn != null) conn.rollback(); 
                LOGGER.log(Level.SEVERE, "DB Transaction failed. Memory state preserved.", e);
                throw new Exception("Transaction failed. System rolled back.", e);
            }
        }
    }

    public BigDecimal getBalance() {
        return account.balance();
    }
}