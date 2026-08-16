package com.cooperative.payment_service.client;

import com.cooperative.payment_service.domain.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class AccountServiceClient {

    private final RestClient restClient;

    public AccountServiceClient(@Value("${app.account-service.url}") String accountServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(accountServiceUrl)
                .build();
    }

    public DebitResponse requestDebit(Payment payment) {
        try {
            DebitResponse response = restClient.post()
                    .uri("/api/accounts/debit")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new DebitRequest(
                            payment.getAccountNumber(),
                            payment.getAmount(),
                            payment.getReference()))
                    .retrieve()
                    .body(DebitResponse.class);

            if (response != null && response.success()) {
                return response;
            }
            return DebitResponse.failure(response == null ? "Debit returned no response" : response.message());
        } catch (RestClientResponseException ex) {
            return DebitResponse.failure("Debit rejected with status " + ex.getStatusCode().value());
        } catch (ResourceAccessException ex) {
            return DebitResponse.failure("Account service unavailable");
        }
    }
}
