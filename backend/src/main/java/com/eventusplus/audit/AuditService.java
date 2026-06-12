package com.eventusplus.audit;

import com.eventusplus.security.UserPrincipal;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(UserPrincipal actor, AuditAction action, String targetType, String targetId, String details, String ipAddress) {
        log(actor != null ? actor.id() : null, actor != null ? actor.getUsername() : null, action, targetType, targetId, details, ipAddress);
    }

    @Transactional
    public void log(Long actorUserId, String actorEmail, AuditAction action, String targetType, String targetId, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorUserId(actorUserId);
        auditLog.setActorEmail(actorEmail);
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> listRecent(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        return auditLogRepository.findAllByOrderByOccurredAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(AuditLogResponse::from)
                .toList();
    }
}
