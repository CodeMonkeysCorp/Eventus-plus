package com.eventusplus.audit;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        AuditAction action,
        String targetType,
        String targetId,
        String actorEmail,
        String details,
        String ipAddress,
        Instant occurredAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getActorEmail(),
                log.getDetails(),
                log.getIpAddress(),
                log.getOccurredAt()
        );
    }
}
