package com.eventusplus.security;

import com.eventusplus.audit.AuditAction;
import com.eventusplus.audit.AuditService;
import com.eventusplus.common.web.RequestUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationEntryPointAuditHandler implements AuthenticationEntryPoint {

    private final AuditService auditService;

    public AuthenticationEntryPointAuditHandler(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        auditService.log(
                null,
                null,
                AuditAction.AUTHENTICATION_REQUIRED,
                "ENDPOINT",
                request.getRequestURI(),
                "Tentativa de acesso sem autenticação.",
                RequestUtils.resolveClientIp(request)
        );
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Autenticação necessária.");
    }
}
