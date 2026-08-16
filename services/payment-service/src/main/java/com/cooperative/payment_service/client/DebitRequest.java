package com.cooperative.payment_service.client;

import java.math.BigDecimal;

public record DebitRequest(
        String accountNumber,
        BigDecimal amount,
        String reference) {
}
