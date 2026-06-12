package com.eventusplus.certificate;

import com.eventusplus.registration.RegistrationService;
import com.eventusplus.security.UserPrincipal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final RegistrationService registrationService;

    public CertificateController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public List<CertificateResponse> listMyCertificates(@AuthenticationPrincipal UserPrincipal principal) {
        return registrationService.listMyCertificates(principal);
    }
}
