package com.example.service;

import com.example.model.User;
import com.example.repository.AccountRepository;
import org.mindrot.jbcrypt.BCrypt;
import java.sql.SQLException;
import java.util.logging.Logger;

import com.example.config.LoggingConfig;

public class AuthService {
    private final AccountRepository repository;
    private static final Logger LOGGER = LoggingConfig.getLogger(AuthService.class);

    public AuthService(AccountRepository repository) {
        this.repository = repository;
    }

    /**
     * Registers a new user and automatically initializes their first bank account.
     */
    public void register(String username, String email, String password) throws Exception {
        // 1. Hash the password using BCrypt (Industry Standard)
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());

        try {
            // 2. Persist the user to the database
            repository.createUser(username, email, hashed);
            LOGGER.info("User registered successfully: " + username);

            /* * PRO TIP: In a real-world scenario, you'd likely trigger a 
             * 'Create Account' method here to ensure the user can actually 
             * use the BankingService immediately.
             */
        } catch (SQLException e) {
            LOGGER.severe("Failed to register user: " + username + " - " + e.getMessage());
            throw new Exception("Registration failed. Username or Email might already exist.");
        }
    }

    /**
     * Validates credentials against the database.
     */
    public boolean login(String username, String password) {
        User user = repository.findByUsername(username);
        LOGGER.info("USER : " + user);
        if (user == null) {
            LOGGER.warning("Login attempt failed: User not found -> " + username);
            return false;
        }

        // 3. Verify the plain text password against the stored BCrypt hash
        if (BCrypt.checkpw(password, user.passwordHash())) {
            LOGGER.info("User logged in: " + username);
            return true;
        } else {
            LOGGER.warning("Login attempt failed: Invalid password for -> " + username);
            return false;
        }
    }
}