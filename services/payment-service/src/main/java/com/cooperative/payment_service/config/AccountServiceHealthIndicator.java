package com.cooperative.payment_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class AccountServiceHealthIndicator implements HealthIndicator {

    private final RestClient restClient;

    public AccountServiceHealthIndicator(@Value("${app.account-service.url}") String accountServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(accountServiceUrl)
                .build();
    }

    @Override
    public Health health() {
        try {
            restClient.get()
                    .uri("/actuator/health")
                    .retrieve()
                    .toBodilessEntity();
            return Health.up()
                    .withDetail("account-service", "reachable")
                    .build();
        } catch (Exception ex) {
            return Health.down()
                    .withDetail("account-service", ex.getMessage())
                    .build();
        }
    }
}
