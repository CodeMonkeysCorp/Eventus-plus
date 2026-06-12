package com.eventusplus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bootstrap")
public record BootstrapAdminProperties(String adminName, String adminEmail, String adminPassword) {
}
