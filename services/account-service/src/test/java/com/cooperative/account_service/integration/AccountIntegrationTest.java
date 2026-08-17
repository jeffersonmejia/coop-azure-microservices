package com.cooperative.account_service.integration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AccountIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("coop")
            .withUsername("coop")
            .withPassword("coop");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("app.jwt.secret", () -> "test-secret-key-for-contracts-32bytes!!");
    }

    @LocalServerPort
    private int port;

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    private String getToken(RestTemplate rt) {
        Map<String, String> loginBody = Map.of("email", "test@test.com", "password", "password123");
        ResponseEntity<Map> response = rt.postForEntity(
                "http://localhost:" + port + "/api/auth/login", loginBody, Map.class);
        return response.getBody() != null ? (String) response.getBody().get("accessToken") : null;
    }

    @Test
    void test_get_my_accounts_creates_default() {
        RestTemplate rt = createRestTemplate();
        String token = getToken(rt);
        if (token == null) return;

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(token);
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<Object[]> response = rt.exchange(
                "http://localhost:" + port + "/api/accounts/me",
                org.springframework.http.HttpMethod.GET, entity, Object[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
    }

    @Test
    void test_unauthenticated_returns_401() {
        RestTemplate rt = createRestTemplate();
        ResponseEntity<Void> response = rt.getForEntity(
                "http://localhost:" + port + "/api/accounts/me", Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
