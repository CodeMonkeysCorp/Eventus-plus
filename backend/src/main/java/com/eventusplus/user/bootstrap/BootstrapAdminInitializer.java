package com.eventusplus.user.bootstrap;

import com.eventusplus.config.BootstrapAdminProperties;
import com.eventusplus.user.model.UserAccount;
import com.eventusplus.user.model.UserRole;
import com.eventusplus.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(BootstrapAdminInitializer.class);

    private final BootstrapAdminProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapAdminInitializer(
            BootstrapAdminProperties properties,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (isBlank(properties.adminEmail()) || isBlank(properties.adminPassword())) {
            LOGGER.info("Bootstrap de administrador ignorado: ADMIN_EMAIL ou ADMIN_PASSWORD não configurados.");
            return;
        }

        String normalizedEmail = properties.adminEmail().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            return;
        }

        UserAccount admin = new UserAccount();
        admin.setFullName(isBlank(properties.adminName()) ? "Administrador" : properties.adminName().trim());
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(properties.adminPassword().trim()));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        LOGGER.info("Usuário administrador bootstrap criado com e-mail {}.", normalizedEmail);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
