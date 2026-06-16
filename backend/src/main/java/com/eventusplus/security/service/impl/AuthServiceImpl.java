package com.eventusplus.security.service.impl;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.service.AuditService;
import com.eventusplus.common.exception.ConflictException;
import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.common.exception.UnauthorizedException;
import com.eventusplus.security.dto.AuthResponse;
import com.eventusplus.security.service.AuthService;
import com.eventusplus.security.service.JwtService;
import com.eventusplus.security.dto.LoginRequest;
import com.eventusplus.security.dto.RegisterRequest;
import com.eventusplus.security.model.UserPrincipal;
import com.eventusplus.user.model.UserAccount;
import com.eventusplus.user.repository.UserRepository;
import com.eventusplus.user.dto.UserResponse;
import com.eventusplus.user.model.UserRole;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("JÃ¡ existe um usuÃ¡rio cadastrado com este e-mail.");
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password().trim()));
        user.setRole(UserRole.PARTICIPANT);
        user.setActive(true);
        UserAccount savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.from(savedUser);
        auditService.log(
                savedUser.getId(),
                savedUser.getEmail(),
                AuditAction.REGISTER,
                "USER",
                savedUser.getId().toString(),
                "Novo participante cadastrado.",
                ipAddress
        );
        return new AuthResponse(jwtService.generateToken(principal), UserResponse.from(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String normalizedEmail = normalizeEmail(request.email());
        try {
            UserPrincipal principal = (UserPrincipal) authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            ).getPrincipal();

            UserAccount user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("UsuÃ¡rio nÃ£o encontrado."));

            auditService.log(
                    user.getId(),
                    user.getEmail(),
                    AuditAction.LOGIN_SUCCESS,
                    "USER",
                    user.getId().toString(),
                    "Login realizado com sucesso.",
                    ipAddress
            );
            return new AuthResponse(jwtService.generateToken(principal), UserResponse.from(user));
        } catch (AuthenticationException exception) {
            auditService.log(
                    null,
                    normalizedEmail,
                    AuditAction.LOGIN_FAILURE,
                    "USER",
                    normalizedEmail,
                    "Tentativa de login com credenciais invÃ¡lidas.",
                    ipAddress
            );
            throw new UnauthorizedException("E-mail ou senha invÃ¡lidos.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse currentUser(UserPrincipal principal) {
        UserAccount user = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃ¡rio nÃ£o encontrado."));
        return UserResponse.from(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
