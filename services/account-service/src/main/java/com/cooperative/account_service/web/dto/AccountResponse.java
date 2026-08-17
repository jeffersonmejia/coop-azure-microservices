package com.cooperative.account_service.web.dto;

import com.cooperative.account_service.domain.Account;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountResponse(
        Long id,
        String accountNumber,
        Long userId,
        BigDecimal balance,
        String status,
        Instant createdAt) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getUserId(),
                account.getBalance(),
                account.getStatus().name(),
                account.getCreatedAt());
    }
}
