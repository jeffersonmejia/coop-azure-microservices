package com.cooperative.auth_service.contract;

import com.cooperative.auth_service.domain.Role;
import com.cooperative.auth_service.domain.User;
import com.cooperative.auth_service.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "app.jwt.secret=test-secret-key-for-contracts-32bytes!!")
class JwtContractTest {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Test
    void test_jwt_has_required_claims() {
        User user = new User();
        user.setId(100L);
        user.setEmail("contract@test.com");
        user.setRole(Role.ADMIN);

        String token = jwtService.generateToken(user);
        var jwt = jwtDecoder.decode(token);

        assertThat(jwt.getSubject()).isNotBlank();
        assertThat((Object) jwt.getClaim("uid")).isNotNull();
        assertThat((Object) jwt.getClaim("role")).isIn("USER", "ADMIN");
        assertThat(jwt.getIssuer()).isNotNull();
        assertThat(jwt.getExpiresAt()).isAfter(Instant.now());
        assertThat(jwt.getIssuedAt()).isBeforeOrEqualTo(Instant.now());
    }

    @Test
    void test_uid_matches_user_id() {
        User user = new User();
        user.setId(999L);
        user.setEmail("uid@test.com");
        user.setRole(Role.USER);

        String token = jwtService.generateToken(user);
        var jwt = jwtDecoder.decode(token);

        assertThat((Object) jwt.getClaim("uid")).isEqualTo(999);
    }

    @Test
    void test_issuer_is_auth_service() {
        User user = new User();
        user.setId(1L);
        user.setEmail("iss@test.com");
        user.setRole(Role.USER);

        String token = jwtService.generateToken(user);
        var jwt = jwtDecoder.decode(token);

        assertThat(jwt.getIssuer().toString()).isEqualTo("auth-service");
    }
}
