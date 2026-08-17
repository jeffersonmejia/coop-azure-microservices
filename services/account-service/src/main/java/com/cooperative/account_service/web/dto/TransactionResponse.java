package com.cooperative.account_service.web.dto;

import com.cooperative.account_service.domain.AccountTransaction;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        String sourceAccountNumber,
        String destinationAccountNumber,
        BigDecimal amount,
        String type,
        String status,
        String reference,
        Instant occurredAt) {

    public static TransactionResponse from(
            AccountTransaction transaction,
            String sourceAccountNumber,
            String destinationAccountNumber) {
        return new TransactionResponse(
                transaction.getId(),
                sourceAccountNumber,
                destinationAccountNumber,
                transaction.getAmount(),
                transaction.getType().name(),
                transaction.getStatus().name(),
                transaction.getReference(),
                transaction.getOccurredAt());
    }
}
