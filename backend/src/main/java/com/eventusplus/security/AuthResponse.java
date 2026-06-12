package com.eventusplus.security;

import com.eventusplus.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
