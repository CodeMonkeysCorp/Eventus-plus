package com.eventusplus.registration;

import java.time.Instant;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long participantId,
        String participantName,
        String participantEmail,
        RegistrationStatus status,
        Instant registeredAt,
        Instant checkedInAt,
        Instant certificateIssuedAt,
        String checkedInBy
) {
    public static RegistrationResponse from(EventRegistration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getEvent().getTitle(),
                registration.getParticipant().getId(),
                registration.getParticipant().getFullName(),
                registration.getParticipant().getEmail(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getCheckedInAt(),
                registration.getCertificateIssuedAt(),
                registration.getCheckedInBy() != null ? registration.getCheckedInBy().getFullName() : null
        );
    }
}
