package com.cooperative.auth_service.service;

import com.cooperative.auth_service.domain.Role;
import com.cooperative.auth_service.domain.User;
import com.cooperative.auth_service.domain.UserRepository;
import com.cooperative.auth_service.security.JwtService;
import com.cooperative.auth_service.web.dto.AuthResponse;
import com.cooperative.auth_service.web.dto.LoginRequest;
import com.cooperative.auth_service.web.dto.RegisterRequest;
import com.cooperative.auth_service.web.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void test_register_success() {
        when(userRepository.existsByEmailIgnoreCase("user@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UserResponse response = authService.register(
                new RegisterRequest("user@test.com", "password123", "John", "Doe"));

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("user@test.com");
        assertThat(response.firstName()).isEqualTo("John");
    }

    @Test
    void test_register_duplicate_email_throws_409() {
        when(userRepository.existsByEmailIgnoreCase("user@test.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(new RegisterRequest("user@test.com", "password123", "John", "Doe")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void test_login_success() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setPassword("$2a$hashed");
        user.setRole(Role.USER);
        user.setEnabled(true);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("user@test.com", "password123"));

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
    }

    @Test
    void test_login_wrong_password_throws_401() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setPassword("$2a$hashed");
        user.setEnabled(true);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user@test.com", "wrong")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void test_login_disabled_user_throws_401() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setPassword("$2a$hashed");
        user.setEnabled(false);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("user@test.com", "password123")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void test_me_success() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.USER);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));

        UserResponse response = authService.me("user@test.com");

        assertThat(response.email()).isEqualTo("user@test.com");
        assertThat(response.firstName()).isEqualTo("John");
    }

    @Test
    void test_me_user_not_found_throws_404() {
        when(userRepository.findByEmailIgnoreCase("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.me("missing@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
