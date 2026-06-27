package com.eventusplus.user.service.impl;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.service.AuditService;
import com.eventusplus.common.exception.ConflictException;
import com.eventusplus.common.exception.ForbiddenOperationException;
import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.security.model.UserPrincipal;
import com.eventusplus.user.dto.UserCreateRequest;
import com.eventusplus.user.dto.UserResponse;
import com.eventusplus.user.dto.UserStatusRequest;
import com.eventusplus.user.dto.UserUpdateRequest;
import com.eventusplus.user.model.UserAccount;
import com.eventusplus.user.repository.UserRepository;
import com.eventusplus.user.service.UserManagementService;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserManagementServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse create(UserCreateRequest request, UserPrincipal principal, String ipAddress) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPassword = trimToNull(request.password());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Já existe um usuário cadastrado com este e-mail.");
        }
        if (normalizedPassword == null) {
            throw new IllegalStateException("A senha deve ser informada.");
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(normalizedPassword));
        user.setRole(request.role());
        user.setActive(true);

        UserAccount savedUser = userRepository.save(user);
        auditService.log(
                principal,
                AuditAction.USER_CREATED,
                "USER",
                savedUser.getId().toString(),
                "Usuário criado: " + savedUser.getEmail(),
                ipAddress
        );
        return UserResponse.from(savedUser);
    }

    @Override
    @Transactional
    public UserResponse update(Long userId, UserUpdateRequest request, UserPrincipal principal, String ipAddress) {
        preventSelfManagement(userId, principal);

        UserAccount user = findUser(userId);
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, userId)) {
            throw new ConflictException("Já existe um usuário cadastrado com este e-mail.");
        }

        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(request.role());

        String normalizedPassword = trimToNull(request.password());
        boolean passwordUpdated = normalizedPassword != null;
        if (passwordUpdated) {
            user.setPasswordHash(passwordEncoder.encode(normalizedPassword));
        }

        UserAccount savedUser = userRepository.save(user);
        auditService.log(
                principal,
                AuditAction.USER_UPDATED,
                "USER",
                savedUser.getId().toString(),
                buildUpdateDetails(savedUser, passwordUpdated),
                ipAddress
        );
        return UserResponse.from(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long userId, UserStatusRequest request, UserPrincipal principal, String ipAddress) {
        preventSelfManagement(userId, principal);

        UserAccount user = findUser(userId);
        user.setActive(Boolean.TRUE.equals(request.active()));

        UserAccount savedUser = userRepository.save(user);
        auditService.log(
                principal,
                AuditAction.USER_STATUS_UPDATED,
                "USER",
                savedUser.getId().toString(),
                savedUser.isActive()
                        ? "Usuário reativado: " + savedUser.getEmail()
                        : "Usuário desativado: " + savedUser.getEmail(),
                ipAddress
        );
        return UserResponse.from(savedUser);
    }

    private UserAccount findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    private void preventSelfManagement(Long userId, UserPrincipal principal) {
        if (principal != null && principal.id().equals(userId)) {
            throw new ForbiddenOperationException("Seu próprio acesso não pode ser alterado por esta tela.");
        }
    }

    private String buildUpdateDetails(UserAccount user, boolean passwordUpdated) {
        if (passwordUpdated) {
            return "Usuário atualizado com redefinição de senha: " + user.getEmail();
        }
        return "Usuário atualizado: " + user.getEmail();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
