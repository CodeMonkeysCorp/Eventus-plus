package com.eventusplus.security.service;

import com.eventusplus.security.dto.AuthResponse;
import com.eventusplus.security.dto.LoginRequest;
import com.eventusplus.security.dto.RegisterRequest;
import com.eventusplus.security.model.UserPrincipal;
import com.eventusplus.user.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request, String ipAddress);

    AuthResponse login(LoginRequest request, String ipAddress);

    UserResponse currentUser(UserPrincipal principal);
}
