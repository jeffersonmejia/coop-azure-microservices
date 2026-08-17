package com.cooperative.payment_service.e2e;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Disabled("Run only with full stack via docker compose up")
class E2ETest {

    private static final String AUTH_URL = "http://localhost:8081";
    private static final String ACCOUNT_URL = "http://localhost:8082";
    private static final String PAYMENT_URL = "http://localhost:8083";

    private final RestTemplate restTemplate = new RestTemplate();

    @Test
    void test_full_user_flow() {
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);

        // Register
        Map<String, String> registerBody = Map.of(
                "email", "e2euser@test.com",
                "password", "password123",
                "firstName", "E2E",
                "lastName", "User");
        ResponseEntity<Void> registerResponse = restTemplate.postForEntity(
                AUTH_URL + "/api/auth/register", new HttpEntity<>(registerBody, jsonHeaders), Void.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Login
        Map<String, String> loginBody = Map.of("email", "e2euser@test.com", "password", "password123");
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                AUTH_URL + "/api/auth/login", new HttpEntity<>(loginBody, jsonHeaders), Map.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = (String) loginResponse.getBody().get("accessToken");

        // Get accounts
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(token);
        HttpEntity<Void> authEntity = new HttpEntity<>(authHeaders);

        ResponseEntity<Object[]> accountsResponse = restTemplate.exchange(
                ACCOUNT_URL + "/api/accounts/me", HttpMethod.GET, authEntity, Object[].class);
        assertThat(accountsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(accountsResponse.getBody()).isNotEmpty();

        Map account = (Map) accountsResponse.getBody()[0];
        String accountNumber = (String) account.get("accountNumber");
        assertThat(accountNumber).hasSize(10);

        // Make payment
        Map<String, Object> paymentBody = Map.of(
                "accountNumber", accountNumber,
                "amount", 25.00,
                "description", "E2E test payment");
        ResponseEntity<Map> paymentResponse = restTemplate.postForEntity(
                PAYMENT_URL + "/api/payments",
                new HttpEntity<>(paymentBody, authHeaders),
                Map.class);
        assertThat(paymentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(paymentResponse.getBody().get("status")).isEqualTo("COMPLETED");

        // Check history
        ResponseEntity<Map> historyResponse = restTemplate.exchange(
                ACCOUNT_URL + "/api/accounts/me/transactions?page=0&size=10",
                HttpMethod.GET, authEntity, Map.class);
        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void test_payment_insufficient_balance() {
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);

        // Register and login
        Map<String, String> registerBody = Map.of(
                "email", "poor@test.com",
                "password", "password123",
                "firstName", "Poor",
                "lastName", "User");
        restTemplate.postForEntity(AUTH_URL + "/api/auth/register", new HttpEntity<>(registerBody, jsonHeaders), Void.class);

        Map<String, String> loginBody = Map.of("email", "poor@test.com", "password", "password123");
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                AUTH_URL + "/api/auth/login", new HttpEntity<>(loginBody, jsonHeaders), Map.class);
        String token = (String) loginResponse.getBody().get("accessToken");

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(token);
        HttpEntity<Void> authEntity = new HttpEntity<>(authHeaders);

        // Get account
        ResponseEntity<Object[]> accountsResponse = restTemplate.exchange(
                ACCOUNT_URL + "/api/accounts/me", HttpMethod.GET, authEntity, Object[].class);
        String accountNumber = (String) ((Map) accountsResponse.getBody()[0]).get("accountNumber");

        // Attempt large payment
        Map<String, Object> paymentBody = Map.of(
                "accountNumber", accountNumber,
                "amount", 99999.00,
                "description", "Should fail");
        ResponseEntity<Map> paymentResponse = restTemplate.postForEntity(
                PAYMENT_URL + "/api/payments",
                new HttpEntity<>(paymentBody, authHeaders),
                Map.class);
        assertThat(paymentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(paymentResponse.getBody().get("status")).isEqualTo("FAILED");
    }
}
