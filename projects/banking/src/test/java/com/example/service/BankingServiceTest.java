package com.example.service;

import com.example.config.DatabaseConfig;
import com.example.model.Account;
import com.example.repository.AccountRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.sql.Connection;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BankingServiceTest {

    @Mock
    private AccountRepository repository;

    @Mock
    private Connection mockConnection;

    // Kept open for the full test lifecycle, closed in @AfterEach
    private MockedStatic<DatabaseConfig> mockedStatic;

    private BankingService bankingService;
    private Account initialAccount;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);

        mockedStatic = mockStatic(DatabaseConfig.class);
        mockedStatic.when(DatabaseConfig::getConnection).thenReturn(mockConnection);

        // REMOVED: mockConnection.createStatement() — never called, unnecessary
        // REMOVED: doNothing().when(mockConnection).setAutoCommit(false) — void methods do nothing by default
        // REMOVED: doNothing().when(mockConnection).commit() — same reason
        // REMOVED: doNothing().when(mockConnection).close() — same reason

        initialAccount = new Account(
            1,
            1,
            "TR1234567890",
            "CHECKING",
            new BigDecimal("1000.00"),
            "TRY",
            LocalDateTime.now(),
            LocalDateTime.now()
        );

        lenient().when(repository.findByOwner(eq("bkckr")))
                .thenReturn(initialAccount);

        bankingService = new BankingService(repository, "bkckr");
    }

    @AfterEach
    void tearDown() {
        // Must close MockedStatic after each test to avoid state leaking
        mockedStatic.close();
    }

    @Test
    void testSuccessfulDeposit() throws Exception {
        BigDecimal depositAmount = new BigDecimal("500.00");

        bankingService.executeTransaction(depositAmount, "DEPOSIT");

        assertEquals(new BigDecimal("1500.00"), bankingService.getBalance());

        verify(repository, times(1)).updateBalance(any(Connection.class), any(Account.class));
        verify(repository, times(1)).logTransaction(
            any(Connection.class),
            eq(1),
            eq(depositAmount),
            eq("DEPOSIT")
        );
    }

    @Test
    void testWithdrawInsufficientFundsThrowsException() throws Exception {
        BigDecimal bigAmount = new BigDecimal("2000.00");

        assertThrows(IllegalArgumentException.class, () ->
            bankingService.executeTransaction(bigAmount, "WITHDRAWAL")
        );

        assertEquals(new BigDecimal("1000.00"), bankingService.getBalance());
        verify(repository, never()).updateBalance(any(), any());
    }

    @Test
    void testSuccessfulWithdrawal() throws Exception {
        BigDecimal withdrawAmount = new BigDecimal("300.00");

        bankingService.executeTransaction(withdrawAmount, "WITHDRAWAL");

        assertEquals(new BigDecimal("700.00"), bankingService.getBalance());

        verify(repository, times(1)).updateBalance(any(Connection.class), any(Account.class));
        verify(repository, times(1)).logTransaction(
            any(Connection.class),
            eq(1),
            eq(withdrawAmount),
            eq("WITHDRAWAL")
        );
    }
}