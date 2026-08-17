package com.cooperative.auth_service.security;

import com.cooperative.auth_service.domain.Role;
import com.cooperative.auth_service.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "app.jwt.secret=test-secret-key-for-contracts-32bytes!!")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Test
    void test_generateToken_contains_correct_claims() {
        User user = new User();
        user.setId(42L);
        user.setEmail("test@test.com");
        user.setRole(Role.USER);

        String token = jwtService.generateToken(user);
        var jwt = jwtDecoder.decode(token);

        assertThat(jwt.getSubject()).isEqualTo("test@test.com");
        assertThat(jwt.<Long>getClaim("uid")).isEqualTo(42L);
        assertThat((Object) jwt.getClaim("role")).isEqualTo("USER");
        assertThat(jwt.getClaimAsString("iss")).isEqualTo("auth-service");
    }

    @Test
    void test_token_is_not_expired() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setRole(Role.USER);

        String token = jwtService.generateToken(user);
        var jwt = jwtDecoder.decode(token);

        assertThat(jwt.getExpiresAt()).isAfter(Instant.now());
    }
}
