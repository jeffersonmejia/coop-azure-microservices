package com.cooperative.payment_service.client;

public record DebitResponse(
        boolean success,
        String message,
        Long transactionId) {

    public static DebitResponse ok(Long transactionId) {
        return new DebitResponse(true, "Debit applied", transactionId);
    }

    public static DebitResponse failure(String message) {
        return new DebitResponse(false, message, null);
    }
}
