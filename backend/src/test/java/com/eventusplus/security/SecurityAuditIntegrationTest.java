package com.eventusplus.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.model.AuditLog;
import com.eventusplus.audit.repository.AuditLogRepository;
import com.jayway.jsonpath.JsonPath;
import java.util.Comparator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuditIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void shouldPersistAuditLogWhenParticipantAccessIsDenied() throws Exception {
        String participantToken = loginAsParticipant();

        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + participantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Evento restrito",
                                  "description": "Tentativa bloqueada",
                                  "location": "Laboratorio 1",
                                  "startsAt": "2026-07-11T19:00:00",
                                  "endsAt": "2026-07-11T21:00:00",
                                  "capacity": 20,
                                  "status": "PUBLISHED"
                                }
                                """))
                .andExpect(status().isForbidden());

        AuditLog latestLog = auditLogRepository.findAll().stream()
                .max(Comparator.comparing(AuditLog::getId))
                .orElseThrow();

        assertThat(latestLog.getAction()).isEqualTo(AuditAction.ACCESS_DENIED);
        assertThat(latestLog.getActorEmail()).isEqualTo("participant@test.local");
        assertThat(latestLog.getTargetType()).isEqualTo("ENDPOINT");
        assertThat(latestLog.getTargetId()).isEqualTo("/api/events");
    }

    private String loginAsParticipant() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "participant@test.local",
                                  "password": "Participant123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }
}
