package com.example.service;

import com.example.config.DatabaseConfig;
import com.example.config.LoggingConfig;
import com.example.model.Account;
import com.example.repository.AccountRepository;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.*;
import java.io.IOException;

public class BankingService {
    private Account account;
    private final AccountRepository repository;
    private static final Logger LOGGER = LoggingConfig.getLogger(BankingService.class);

    static {
        try {
            // Log file is created in the project root
            FileHandler fh = new FileHandler("banking_system.log", true);
            // Use XMLFormatter or a custom one for easier machine parsing if needed
            fh.setFormatter(new SimpleFormatter());
            LOGGER.addHandler(fh);
            LOGGER.setLevel(Level.ALL);
        } catch (IOException e) {
            System.err.println("Critical Failure: Logger initialization failed: " + e.getMessage());
        }
    }

    public BankingService(AccountRepository repository, String owner) {
        this.repository = repository;
        this.account = repository.findByOwner(owner);

        if (this.account == null) {
            String errorMsg = "Critical Initialization Failure: Account for '" + owner + "' not found.";
            LOGGER.severe(errorMsg);
            // Throwing an exception here prevents the object from being created in a broken state
            throw new IllegalStateException(errorMsg);
        }
    }

    public void transfer(String targetOwner, BigDecimal amount) throws Exception {
        try (Connection conn = DatabaseConfig.getConnection()) {
            try {
                conn.setAutoCommit(false);

                Account targetAccount = repository.findByOwner(targetOwner);
                if (targetAccount == null)
                    throw new IllegalArgumentException("Target account not found: " + targetOwner);

                // Currency guard — reject cross-currency transfers
                if (!account.currency().equalsIgnoreCase(targetAccount.currency())) {
                    throw new IllegalArgumentException(String.format(
                        "Currency mismatch: your account is %s, target account is %s. " +
                        "Cross-currency transfers are not supported.",
                        account.currency(), targetAccount.currency()
                    ));
                }

                Account sourceNext = account.withdraw(amount);
                Account targetNext = targetAccount.deposit(amount);

                repository.updateBalance(conn, sourceNext);
                repository.updateBalance(conn, targetNext);
                repository.logTransaction(conn, sourceNext.id(), amount.negate(), "TRANSFER_OUT");
                repository.logTransaction(conn, targetNext.id(), amount, "TRANSFER_IN");

                conn.commit();
                this.account = sourceNext;

            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        }
    }

    public void executeTransaction(BigDecimal amount, String type) throws Exception {
        String logPrefix = String.format("[%s Operation | Account: %s] ", type, account.accountNumber());
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            try {
                conn.setAutoCommit(false);
                LOGGER.fine(logPrefix + "Database connection established and transaction started.");

                Account nextState = type.equalsIgnoreCase("DEPOSIT") 
                    ? account.deposit(amount) 
                    : account.withdraw(amount);

                // Log intended state change for audit
                LOGGER.info(logPrefix + "Attempting balance update: " + account.balance() + " -> " + nextState.balance());

                repository.updateBalance(conn, nextState);
                repository.logTransaction(conn, nextState.id(), amount, type);

                conn.commit();
                this.account = nextState;
                LOGGER.info(logPrefix + "SUCCESS: Database committed and memory state synchronized.");

            } catch (SQLException sqlEx) {
                if (conn != null) {
                    conn.rollback();
                    LOGGER.warning(logPrefix + "Transaction rolled back due to SQL error: " + sqlEx.getSQLState());
                }
                // Log detailed SQL error information
                LOGGER.log(Level.SEVERE, logPrefix + "CRITICAL DB FAILURE: " + sqlEx.getMessage(), sqlEx);
                throw new Exception("Database operation failed. Reason: " + sqlEx.getMessage(), sqlEx);

            } catch (IllegalArgumentException domainEx) {
                // This captures business rule violations (e.g., Insufficient Funds)
                LOGGER.log(Level.WARNING, logPrefix + "BUSINESS RULE VIOLATION: " + domainEx.getMessage());
                throw domainEx;

            } catch (Exception e) {
                if (conn != null) conn.rollback();
                LOGGER.log(Level.SEVERE, logPrefix + "UNEXPECTED SYSTEM ERROR: " + e.getClass().getSimpleName(), e);
                throw e;
            }
        } catch (SQLException connEx) {
            LOGGER.severe(logPrefix + "CONNECTION FAILURE: Could not connect to database at " + DatabaseConfig.getUrl());
            throw new Exception("Unable to reach the database server.", connEx);
        }
    }

    public BigDecimal getBalance() { return account.balance(); }

    public List<String> getHistory() {
        return repository.getTransactionHistory(account.id());
    }
}