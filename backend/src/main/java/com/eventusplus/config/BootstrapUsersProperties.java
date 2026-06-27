package com.eventusplus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bootstrap")
public record BootstrapUsersProperties(
        String adminName,
        String adminEmail,
        String adminPassword,
        String operatorName,
        String operatorEmail,
        String operatorPassword,
        String participantName,
        String participantEmail,
        String participantPassword
) {
}
