package com.cooperative.payment_service.web.dto;

import com.cooperative.payment_service.domain.Payment;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long userId,
        String accountNumber,
        BigDecimal amount,
        String description,
        String status,
        String failureReason,
        String reference,
        Instant createdAt,
        Instant updatedAt) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getUserId(),
                payment.getAccountNumber(),
                payment.getAmount(),
                payment.getDescription(),
                payment.getStatus().name(),
                payment.getFailureReason(),
                payment.getReference(),
                payment.getCreatedAt(),
                payment.getUpdatedAt());
    }
}
