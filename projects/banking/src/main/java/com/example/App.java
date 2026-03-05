package com.example;

import com.example.repository.PostgresAccountRepository;
import com.example.scheduler.ExchangeRateScheduler;
import com.example.config.LoggingConfig;
import com.example.repository.AccountRepository;
import com.example.service.BankingService;
import com.example.service.ExchangeRateService;

import io.github.cdimascio.dotenv.Dotenv;

import com.example.service.AuthService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Scanner;

public class App {

    // --- Input Helpers ---

    private static String prompt(Scanner scanner, String message) {
        System.out.print(message);
        return scanner.nextLine().trim();
    }

    /**
     * Repeatedly asks for input until a valid positive BigDecimal is entered.
     * Returns null if the user types "cancel".
     */
    private static BigDecimal promptAmount(Scanner scanner, String message) {
        while (true) {
            String input = prompt(scanner, message + " (or 'cancel'): ");
            if (input.equalsIgnoreCase("cancel")) return null;
            try {
                BigDecimal amount = new BigDecimal(input);
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                    System.out.println("  ⚠️  Amount must be greater than zero. Try again.");
                    continue;
                }
                return amount;
            } catch (NumberFormatException e) {
                System.out.println("  ⚠️  Invalid format. Please enter a number like 100 or 49.99.");
            }
        }
    }

    // --- Auth Phase ---

    private static String runAuthPhase(Scanner scanner, AuthService authService) {
        while (true) {
            System.out.println("\n1. Register | 2. Login | 3. Exit");
            String choice = prompt(scanner, "Choice: ");

            switch (choice) {
                case "1" -> {
                    String u = prompt(scanner, "New Username : ");
                    String e = prompt(scanner, "Email        : ");
                    String p = prompt(scanner, "Password     : ");
                    try {
                        authService.register(u, e, p);
                        System.out.println("  ✅ Registered! Please log in.");
                    } catch (Exception ex) {
                        System.out.println("  ❌ " + ex.getMessage());
                    }
                }
                case "2" -> {
                    String u = prompt(scanner, "Username : ");
                    String p = prompt(scanner, "Password : ");
                    try {
                        if (authService.login(u, p)) {
                            System.out.println("  🔓 Welcome, " + u + "!");
                            return u; // authenticated — exit loop
                        }
                        System.out.println("  ❌ Invalid username or password.");
                    } catch (Exception ex) {
                        System.out.println("  ❌ " + ex.getMessage());
                    }
                }
                case "3" -> { return null; } // exit app
                default  -> System.out.println("  ⚠️  Please enter 1, 2, or 3.");
            }
        }
    }

    // --- Banking Phase ---

    private static void runBankingPhase(Scanner scanner, BankingService bank, String currentUser) {
        while (true) {
            System.out.println("\n==============================");
            System.out.println("  👤 " + currentUser);
            System.out.printf("  💰 Balance: %s%n", bank.getBalance().toPlainString());
            System.out.println("------------------------------");
            System.out.println("  1. Deposit");
            System.out.println("  2. Withdraw");
            System.out.println("  3. Transfer");
            System.out.println("  4. History");
            System.out.println("  5. Logout");
            System.out.println("==============================");

            String choice = prompt(scanner, "Choice: ");

            switch (choice) {
                case "1" -> {
                    BigDecimal amt = promptAmount(scanner, "  Deposit amount");
                    if (amt == null) { System.out.println("  ↩️  Cancelled."); break; }
                    try {
                        bank.executeTransaction(amt, "DEPOSIT");
                        System.out.printf("  ✅ Deposited %s. New balance: %s%n",
                            amt.toPlainString(), bank.getBalance().toPlainString());
                    } catch (Exception e) {
                        System.out.println("  ❌ Deposit failed: " + e.getMessage());
                    }
                }
                case "2" -> {
                    BigDecimal amt = promptAmount(scanner, "  Withdrawal amount");
                    if (amt == null) { System.out.println("  ↩️  Cancelled."); break; }
                    try {
                        bank.executeTransaction(amt, "WITHDRAWAL");
                        System.out.printf("  ✅ Withdrew %s. New balance: %s%n",
                            amt.toPlainString(), bank.getBalance().toPlainString());
                    } catch (IllegalArgumentException e) {
                        // Domain violation — friendly message, no stack trace
                        System.out.println("  ❌ " + e.getMessage());
                    } catch (Exception e) {
                        System.out.println("  ❌ Withdrawal failed: " + e.getMessage());
                    }
                }
                case "3" -> {
                    String target = prompt(scanner, "  Transfer to (username): ");
                    if (target.isBlank()) { System.out.println("  ⚠️  Username cannot be empty."); break; }
                    if (target.equalsIgnoreCase(currentUser)) {
                        System.out.println("  ⚠️  You can't transfer to yourself.");
                        break;
                    }
                    BigDecimal amt = promptAmount(scanner, "  Transfer amount");
                    if (amt == null) { System.out.println("  ↩️  Cancelled."); break; }
                    try {
                        bank.transfer(target, amt);
                        System.out.printf("  ✅ Transferred %s to %s. New balance: %s%n",
                            amt.toPlainString(), target, bank.getBalance().toPlainString());
                    } catch (IllegalArgumentException e) {
                        System.out.println("  ❌ " + e.getMessage());
                    } catch (Exception e) {
                        System.out.println("  ❌ Transfer failed: " + e.getMessage());
                    }
                }
                case "4" -> {
                    List<String> history = bank.getHistory();
                    System.out.println("\n  📜 Recent Transactions");
                    System.out.println("  ----------------------");
                    if (history.isEmpty()) {
                        System.out.println("  No transactions yet.");
                    } else {
                        history.forEach(h -> System.out.println("  " + h));
                    }
                }
                case "5" -> {
                    System.out.println("  👋 Logged out. Goodbye, " + currentUser + "!");
                    return;
                }
                default -> System.out.println("  ⚠️  Please enter 1–5.");
            }
        }
    }

    // --- Entry Point ---

    public static void main(String[] args) {
        LoggingConfig.init();

        String apiKey = Dotenv.load().get("EXCHANGE_RATE_API_KEY");

        ExchangeRateService rateService = new ExchangeRateService(apiKey);
        ExchangeRateScheduler scheduler = new ExchangeRateScheduler(rateService);
        scheduler.start();

        // Shutdown scheduler cleanly when app exits
        Runtime.getRuntime().addShutdownHook(new Thread(scheduler::stop));

        Scanner scanner = new Scanner(System.in);
        AccountRepository repository = new PostgresAccountRepository();
        AuthService authService = new AuthService(repository);

        System.out.println("=== 🏦 Maven Bank ===");

        String currentUser = runAuthPhase(scanner, authService);
        if (currentUser == null) {
            System.out.println("Goodbye!");
            scanner.close();
            return;
        }

        try {
            BankingService bank = new BankingService(repository, currentUser);
            runBankingPhase(scanner, bank, currentUser);
        } catch (IllegalStateException e) {
            // Account not found in DB — likely registered but no account seeded yet
            System.out.println("❌ Could not load your account: " + e.getMessage());
        }

        scanner.close();
    }
}