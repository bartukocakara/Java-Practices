package com.example.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.model.User;
import com.example.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


public class AuthServiceTest {

    @Mock
    private AccountRepository mockRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authService = new AuthService(mockRepository);
    }

    @Test
    void testRegisterHashesPassword() throws Exception {
        String rawPassword = "mySecretPassword";
        
        authService.register("bkckr", "bartu@example.com", rawPassword);

        // Verify repository was called, but NOT with the plain text password
        verify(mockRepository).createUser(eq("bkckr"), eq("bartu@example.com"), argThat(hashed -> 
            BCrypt.checkpw(rawPassword, hashed)
        ));
    }

    @Test
    void testLoginSuccess() {
        String username = "bkckr";
        String password = "correct_pass";
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        // Create a fake user with the hashed password
        User fakeUser = new User(1, username, "x@gmail.com", hashedPassword);
        when(mockRepository.findByUsername(username)).thenReturn(fakeUser);

        boolean result = authService.login(username, password);

        assertTrue(result, "Login should succeed with correct password");
    }

    @Test
    void testLoginFailureWrongPassword() {
        String username = "bkckr";
        String password = "correct_pass";
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        User fakeUser = new User(1, username, "x@gmail.com", hashedPassword);
        when(mockRepository.findByUsername(username)).thenReturn(fakeUser);

        boolean result = authService.login(username, "wrong_pass");

        assertFalse(result, "Login should fail with incorrect password");
    }

    @Test
    void testLoginFailureUserNotFound() {
        when(mockRepository.findByUsername("unknown")).thenReturn(null);

        boolean result = authService.login("unknown", "any_pass");

        assertFalse(result, "Login should fail if user does not exist");
    }
}