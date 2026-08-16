package com.cooperative.auth_service.web.dto;

public record AuthResponse(
        String accessToken,
        String tokenType) {
}
