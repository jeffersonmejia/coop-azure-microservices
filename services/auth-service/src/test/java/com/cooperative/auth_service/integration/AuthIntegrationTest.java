package com.cooperative.auth_service.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

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
    private WebTestClient webTestClient;

    @Test
    void test_register_and_login_flow() {
        Map<String, String> registerBody = Map.of(
                "email", "newuser@test.com",
                "password", "password123",
                "firstName", "John",
                "lastName", "Doe");

        webTestClient.post().uri("/api/auth/register")
                .bodyValue(registerBody)
                .exchange()
                .expectStatus().isOk();

        Map<String, String> loginBody = Map.of(
                "email", "newuser@test.com",
                "password", "password123");

        webTestClient.post().uri("/api/auth/login")
                .bodyValue(loginBody)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").isNotEmpty();
    }

    @Test
    void test_register_duplicate_returns_409() {
        Map<String, String> body = Map.of(
                "email", "dup@test.com",
                "password", "password123",
                "firstName", "John",
                "lastName", "Doe");

        webTestClient.post().uri("/api/auth/register")
                .bodyValue(body)
                .exchange()
                .expectStatus().isOk();

        webTestClient.post().uri("/api/auth/register")
                .bodyValue(body)
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void test_me_without_token_returns_401() {
        webTestClient.get().uri("/api/auth/me")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void test_me_with_valid_token_returns_user() {
        Map<String, String> registerBody = Map.of(
                "email", "metest@test.com",
                "password", "password123",
                "firstName", "Jane",
                "lastName", "Smith");
        webTestClient.post().uri("/api/auth/register")
                .bodyValue(registerBody)
                .exchange()
                .expectStatus().isOk();

        Map<String, String> loginBody = Map.of(
                "email", "metest@test.com",
                "password", "password123");

        String[] tokenHolder = new String[1];
        webTestClient.post().uri("/api/auth/login")
                .bodyValue(loginBody)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").value(v -> tokenHolder[0] = (String) v);

        webTestClient.get().uri("/api/auth/me")
                .header("Authorization", "Bearer " + tokenHolder[0])
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.email").isEqualTo("metest@test.com");
    }
}
