package com.eventusplus.registration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
class RegistrationAuditIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void shouldPersistUtf8AuditLogWhenParticipantRegistersForEvent() throws Exception {
        String adminToken = login("admin@test.local", "Admin123!");
        String participantToken = login("participant@test.local", "Participant123!");
        Long eventId = createPublishedEvent(adminToken);

        mockMvc.perform(post("/api/registrations/events/{eventId}", eventId)
                        .header("Authorization", "Bearer " + participantToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REGISTERED"));

        AuditLog latestLog = auditLogRepository.findAll().stream()
                .filter(log -> log.getAction() == AuditAction.REGISTRATION_CREATED)
                .max(Comparator.comparing(AuditLog::getId))
                .orElseThrow();

        assertThat(latestLog.getActorEmail()).isEqualTo("participant@test.local");
        assertThat(latestLog.getTargetType()).isEqualTo("REGISTRATION");
        assertThat(latestLog.getDetails()).isEqualTo("Inscrição criada no evento Evento UTF-8");
    }

    private Long createPublishedEvent(String adminToken) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Evento UTF-8",
                                  "description": "Evento para validar auditoria",
                                  "location": "Auditorio Central",
                                  "startsAt": "2026-08-10T19:00:00",
                                  "endsAt": "2026-08-10T22:00:00",
                                  "capacity": 80,
                                  "status": "PUBLISHED"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Number eventId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
        return eventId.longValue();
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }
}
