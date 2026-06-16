package com.eventusplus.registration.service;

import com.eventusplus.certificate.dto.CertificateResponse;
import com.eventusplus.registration.dto.RegistrationResponse;
import com.eventusplus.security.model.UserPrincipal;
import java.util.List;

public interface RegistrationService {

    RegistrationResponse registerForEvent(Long eventId, UserPrincipal principal, String ipAddress);

    List<RegistrationResponse> listMyRegistrations(UserPrincipal principal);

    List<RegistrationResponse> listAllRegistrations();

    RegistrationResponse checkIn(Long registrationId, UserPrincipal principal, String ipAddress);

    List<CertificateResponse> listMyCertificates(UserPrincipal principal);
}
