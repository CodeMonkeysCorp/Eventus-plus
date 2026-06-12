package com.eventusplus.attendance;

import com.eventusplus.common.web.RequestUtils;
import com.eventusplus.registration.RegistrationResponse;
import com.eventusplus.registration.RegistrationService;
import com.eventusplus.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final RegistrationService registrationService;

    public AttendanceController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/registrations/{registrationId}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public RegistrationResponse confirmCheckIn(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest
    ) {
        return registrationService.checkIn(registrationId, principal, RequestUtils.resolveClientIp(httpServletRequest));
    }
}
