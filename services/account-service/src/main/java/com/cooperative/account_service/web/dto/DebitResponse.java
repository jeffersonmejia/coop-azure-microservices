package com.cooperative.account_service.web.dto;

public record DebitResponse(
        boolean success,
        String message,
        Long transactionId) {

    public static DebitResponse success(Long transactionId) {
        return new DebitResponse(true, "Debit applied", transactionId);
    }

    public static DebitResponse failure(String message) {
        return new DebitResponse(false, message, null);
    }
}
