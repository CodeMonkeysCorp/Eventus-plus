package com.eventusplus.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserAdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldListUsersAsAdmin() throws Exception {
        String adminToken = login("admin@test.local", "Admin123!");

        mockMvc.perform(get("/api/users")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").isNotEmpty());
    }

    @Test
    void shouldCreateUserAsAdmin() throws Exception {
        String adminToken = login("admin@test.local", "Admin123!");
        String email = "novo-" + UUID.randomUUID() + "@example.com";
        String payload = """
                {
                  "fullName": "Operador Novo",
                  "email": "%s",
                  "password": "Senha123!",
                  "role": "OPERATOR"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("OPERATOR"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldRejectUserManagementForOperator() throws Exception {
        String operatorToken = login("operator@test.local", "Operator123!");

        mockMvc.perform(get("/api/users")
                        .header("Authorization", bearer(operatorToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldBlockDisabledUserTokenAfterStatusUpdate() throws Exception {
        String adminToken = login("admin@test.local", "Admin123!");
        String email = "participante-" + UUID.randomUUID() + "@example.com";
        String createPayload = """
                {
                  "fullName": "Participante Temporário",
                  "email": "%s",
                  "password": "Senha123!",
                  "role": "PARTICIPANT"
                }
                """.formatted(email);

        String createdUserResponse = mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long createdUserId = objectMapper.readTree(createdUserResponse).path("id").asLong();
        String participantToken = login(email, "Senha123!");

        mockMvc.perform(patch("/api/users/{userId}/status", createdUserId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "active": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", bearer(participantToken)))
                .andExpect(status().isUnauthorized());
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.path("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
