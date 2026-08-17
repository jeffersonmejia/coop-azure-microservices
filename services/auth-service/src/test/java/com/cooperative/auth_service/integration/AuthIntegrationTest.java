package com.cooperative.auth_service.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthIntegrationTest {

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
        registry.add("app.jwt.expiration-ms", () -> "3600000");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void test_register_and_login_flow() {
        Map<String, String> registerBody = Map.of(
                "email", "newuser@test.com",
                "password", "password123",
                "firstName", "John",
                "lastName", "Doe");

        ResponseEntity<Void> registerResponse = restTemplate.postForEntity(
                "/api/auth/register", registerBody, Void.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, String> loginBody = Map.of(
                "email", "newuser@test.com",
                "password", "password123");

        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", loginBody, Map.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).containsKey("accessToken");
    }

    @Test
    void test_register_duplicate_returns_409() {
        Map<String, String> body = Map.of(
                "email", "dup@test.com",
                "password", "password123",
                "firstName", "John",
                "lastName", "Doe");

        restTemplate.postForEntity("/api/auth/register", body, Void.class);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/auth/register", body, Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void test_me_without_token_returns_401() {
        ResponseEntity<Void> response = restTemplate.getForEntity(
                "/api/auth/me", Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void test_me_with_valid_token_returns_user() {
        Map<String, String> registerBody = Map.of(
                "email", "metest@test.com",
                "password", "password123",
                "firstName", "Jane",
                "lastName", "Smith");
        restTemplate.postForEntity("/api/auth/register", registerBody, Void.class);

        Map<String, String> loginBody = Map.of(
                "email", "metest@test.com",
                "password", "password123");
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", loginBody, Map.class);
        String token = (String) loginResponse.getBody().get("accessToken");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(token);
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.HttpEntity<>(headers);

        ResponseEntity<Map> meResponse = restTemplate.exchange(
                "/api/auth/me", org.springframework.http.HttpMethod.GET, entity, Map.class);
        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody().get("email")).isEqualTo("metest@test.com");
    }
}
