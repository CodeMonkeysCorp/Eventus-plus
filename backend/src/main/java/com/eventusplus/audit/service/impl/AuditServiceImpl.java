package com.eventusplus.audit.service.impl;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.model.AuditLog;
import com.eventusplus.audit.dto.AuditLogResponse;
import com.eventusplus.audit.repository.AuditLogRepository;
import com.eventusplus.audit.service.AuditService;
import com.eventusplus.security.model.UserPrincipal;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void log(UserPrincipal actor, AuditAction action, String targetType, String targetId, String details, String ipAddress) {
        log(actor != null ? actor.id() : null, actor != null ? actor.getUsername() : null, action, targetType, targetId, details, ipAddress);
    }

    @Override
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

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> listRecent(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        return auditLogRepository.findAllByOrderByOccurredAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(AuditLogResponse::from)
                .toList();
    }
}
