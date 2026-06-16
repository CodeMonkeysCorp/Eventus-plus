package com.eventusplus.certificate.dto;

import com.eventusplus.registration.model.EventRegistration;
import java.time.Instant;

public record CertificateResponse(
        Long registrationId,
        Long eventId,
        String eventTitle,
        Instant issuedAt
) {
    public static CertificateResponse from(EventRegistration registration) {
        return new CertificateResponse(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getEvent().getTitle(),
                registration.getCertificateIssuedAt()
        );
    }
}
