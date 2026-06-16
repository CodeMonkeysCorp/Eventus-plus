package com.eventusplus.security.handler;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.service.AuditService;
import com.eventusplus.common.web.RequestUtils;
import com.eventusplus.security.model.UserPrincipal;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class AccessDeniedAuditHandler implements AccessDeniedHandler {

    private final AuditService auditService;

    public AccessDeniedAuditHandler(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long actorId = null;
        String actorEmail = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            actorId = principal.id();
            actorEmail = principal.getUsername();
        }

        auditService.log(
                actorId,
                actorEmail,
                AuditAction.ACCESS_DENIED,
                "ENDPOINT",
                request.getRequestURI(),
                "Acesso negado ao recurso solicitado.",
                RequestUtils.resolveClientIp(request)
        );
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acesso negado.");
    }
}
