package com.eventusplus.security.service;

import com.eventusplus.security.model.UserPrincipal;

public interface JwtService {

    String generateToken(UserPrincipal principal);

    String extractUsername(String token);

    boolean isTokenValid(String token, UserPrincipal principal);
}
