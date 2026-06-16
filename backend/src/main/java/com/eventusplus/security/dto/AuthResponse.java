package com.eventusplus.security.dto;

import com.eventusplus.user.dto.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
