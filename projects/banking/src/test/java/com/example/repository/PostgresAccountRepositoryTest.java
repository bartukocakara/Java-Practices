package com.example.repository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.example.config.DatabaseConfig;
import com.example.model.Account;
import com.example.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDateTime;

public class PostgresAccountRepositoryTest {

    @Mock private Connection mockConnection;
    @Mock private PreparedStatement mockPreparedStatement;
    @Mock private ResultSet mockResultSet;

    private PostgresAccountRepository repository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        repository = new PostgresAccountRepository();
    }

    @Test
    void testCreateUserExecutesInsert() throws Exception {
        try (MockedStatic<DatabaseConfig> mockedConfig = mockStatic(DatabaseConfig.class)) {
            mockedConfig.when(DatabaseConfig::getConnection).thenReturn(mockConnection);
            when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);

            repository.createUser("testuser", "test@gmail.com", "hashed_pass");

            // Simple insert — no transaction, no commit needed
            verify(mockConnection, never()).setAutoCommit(false);
            verify(mockConnection, never()).commit();
            verify(mockPreparedStatement).setString(1, "testuser");
            verify(mockPreparedStatement).setString(2, "test@gmail.com");
            verify(mockPreparedStatement).setString(3, "hashed_pass");
            verify(mockPreparedStatement).executeUpdate();
        }
    }

    @Test
    void testCreateUserThrowsOnSQLException() throws Exception {
        try (MockedStatic<DatabaseConfig> mockedConfig = mockStatic(DatabaseConfig.class)) {
            mockedConfig.when(DatabaseConfig::getConnection).thenReturn(mockConnection);
            when(mockConnection.prepareStatement(anyString()))
                .thenThrow(new SQLException("DB Crash"));

            assertThrows(SQLException.class, () ->
                repository.createUser("failuser", "fail@gmail.com", "pass")
            );
        }
    }

    @Test
    void testCreateAccountExecutesInsert() throws Exception {
        try (MockedStatic<DatabaseConfig> mockedConfig = mockStatic(DatabaseConfig.class)) {
            mockedConfig.when(DatabaseConfig::getConnection).thenReturn(mockConnection);
            when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);

            repository.createAccount(42, "CHECKING", "TRY-A1B2C3D4", "TRY");

            verify(mockPreparedStatement).setInt(1, 42);
            verify(mockPreparedStatement).setString(2, "TRY-A1B2C3D4");
            verify(mockPreparedStatement).setString(3, "CHECKING");
            verify(mockPreparedStatement).setString(4, "TRY");
            verify(mockPreparedStatement).executeUpdate();
        }
    }

    @Test
    void testFindByUsernameReturnsUser() throws Exception {
        try (MockedStatic<DatabaseConfig> mockedConfig = mockStatic(DatabaseConfig.class)) {
            mockedConfig.when(DatabaseConfig::getConnection).thenReturn(mockConnection);
            when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
            when(mockPreparedStatement.executeQuery()).thenReturn(mockResultSet);

            when(mockResultSet.next()).thenReturn(true);
            when(mockResultSet.getInt("id")).thenReturn(1);
            when(mockResultSet.getString("username")).thenReturn("testuser");
            when(mockResultSet.getString("email")).thenReturn("test@gmail.com");
            when(mockResultSet.getString("password_hash")).thenReturn("hashed_pass");

            User user = repository.findByUsername("testuser");

            assertNotNull(user);
            assertEquals("testuser", user.username());
            assertEquals("test@gmail.com", user.email());
        }
    }

    @Test
    void testFindByUsernameReturnsNullWhenNotFound() throws Exception {
        try (MockedStatic<DatabaseConfig> mockedConfig = mockStatic(DatabaseConfig.class)) {
            mockedConfig.when(DatabaseConfig::getConnection).thenReturn(mockConnection);
            when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
            when(mockPreparedStatement.executeQuery()).thenReturn(mockResultSet);
            when(mockResultSet.next()).thenReturn(false); // no row found

            User user = repository.findByUsername("ghost");

            assertNull(user);
        }
    }

    @Test
    void testUpdateBalanceSetsCorrectValues() throws Exception {
        Account account = new Account(
            5, 1, "TRY-A1B2C3D4", "CHECKING",
            new BigDecimal("750.00"), "TRY",
            LocalDateTime.now(), LocalDateTime.now()
        );

        when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);

        repository.updateBalance(mockConnection, account);

        verify(mockPreparedStatement).setBigDecimal(1, new BigDecimal("750.00"));
        verify(mockPreparedStatement).setInt(2, 5);
        verify(mockPreparedStatement).executeUpdate();
    }
}