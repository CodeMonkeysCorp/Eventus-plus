package com.eventusplus.user;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt
) {
    public static UserResponse from(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
