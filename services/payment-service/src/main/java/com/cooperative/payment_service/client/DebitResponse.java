package com.cooperative.payment_service.client;

public record DebitResponse(
        boolean success,
        String message) {

    public static DebitResponse success() {
        return new DebitResponse(true, "Debit applied");
    }

    public static DebitResponse failure(String message) {
        return new DebitResponse(false, message);
    }
}
