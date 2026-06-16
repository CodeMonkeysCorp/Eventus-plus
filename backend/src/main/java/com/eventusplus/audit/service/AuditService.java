package com.eventusplus.audit.service;

import com.eventusplus.audit.dto.AuditLogResponse;
import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.security.model.UserPrincipal;
import java.util.List;

public interface AuditService {

    void log(UserPrincipal actor, AuditAction action, String targetType, String targetId, String details, String ipAddress);

    void log(Long actorUserId, String actorEmail, AuditAction action, String targetType, String targetId, String details, String ipAddress);

    List<AuditLogResponse> listRecent(int limit);
}
