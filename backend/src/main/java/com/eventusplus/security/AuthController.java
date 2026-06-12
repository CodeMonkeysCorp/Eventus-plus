package com.eventusplus.security;

import com.eventusplus.common.web.RequestUtils;
import com.eventusplus.user.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        return authService.register(request, RequestUtils.resolveClientIp(httpServletRequest));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return authService.login(request, RequestUtils.resolveClientIp(httpServletRequest));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse currentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.currentUser(principal);
    }
}
