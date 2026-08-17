package com.cooperative.payment_service.service;

import com.cooperative.payment_service.client.AccountServiceClient;
import com.cooperative.payment_service.client.DebitResponse;
import com.cooperative.payment_service.domain.Payment;
import com.cooperative.payment_service.domain.PaymentRepository;
import com.cooperative.payment_service.domain.PaymentStatus;
import com.cooperative.payment_service.security.CurrentUser;
import com.cooperative.payment_service.web.dto.CreatePaymentRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AccountServiceClient accountServiceClient;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void test_createPayment_success() {
        when(currentUser.getUserId()).thenReturn(1L);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(accountServiceClient.requestDebit(any(Payment.class), anyString()))
                .thenReturn(new DebitResponse(true, "OK", 100L));

        var response = paymentService.createPayment(
                new CreatePaymentRequest("1000000001", new BigDecimal("50.00"), "test payment"),
                "Bearer token");

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    void test_createPayment_debit_failed() {
        when(currentUser.getUserId()).thenReturn(1L);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(accountServiceClient.requestDebit(any(Payment.class), anyString()))
                .thenReturn(new DebitResponse(false, "Insufficient balance", null));

        var response = paymentService.createPayment(
                new CreatePaymentRequest("1000000001", new BigDecimal("5000.00"), "large payment"),
                "Bearer token");

        assertThat(response.status()).isEqualTo("FAILED");
        assertThat(response.failureReason()).containsIgnoringCase("insufficient");
    }

    @Test
    void test_getPayment_not_found_throws_404() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.getPayment(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void test_getPayment_success() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setUserId(1L);
        payment.setAccountNumber("1000000001");
        payment.setAmount(new BigDecimal("25.00"));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setReference(UUID.randomUUID().toString());
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        var response = paymentService.getPayment(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo("COMPLETED");
    }
}
