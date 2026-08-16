package com.cooperative.auth_service.web.dto;

import com.cooperative.auth_service.domain.User;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());
    }
}
