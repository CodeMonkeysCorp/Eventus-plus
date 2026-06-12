package com.eventusplus.registration;

import com.eventusplus.common.web.RequestUtils;
import com.eventusplus.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/events/{eventId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PARTICIPANT')")
    public RegistrationResponse registerForEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest
    ) {
        return registrationService.registerForEvent(eventId, principal, RequestUtils.resolveClientIp(httpServletRequest));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public List<RegistrationResponse> listMyRegistrations(@AuthenticationPrincipal UserPrincipal principal) {
        return registrationService.listMyRegistrations(principal);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public List<RegistrationResponse> listAllRegistrations() {
        return registrationService.listAllRegistrations();
    }
}
