package com.eventusplus.user.bootstrap;

import com.eventusplus.config.BootstrapUsersProperties;
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
public class BootstrapUsersInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(BootstrapUsersInitializer.class);

    private final BootstrapUsersProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapUsersInitializer(
            BootstrapUsersProperties properties,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        bootstrapUser(properties.adminName(), properties.adminEmail(), properties.adminPassword(), UserRole.ADMIN, "Administrador");
        bootstrapUser(properties.operatorName(), properties.operatorEmail(), properties.operatorPassword(), UserRole.OPERATOR, "Operador");
        bootstrapUser(
                properties.participantName(),
                properties.participantEmail(),
                properties.participantPassword(),
                UserRole.PARTICIPANT,
                "Participante"
        );
    }

    private void bootstrapUser(String fullName, String email, String password, UserRole role, String fallbackName) {
        if (isBlank(email) || isBlank(password)) {
            LOGGER.info("Bootstrap de {} ignorado: e-mail ou senha não configurados.", fallbackName.toLowerCase());
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            return;
        }

        UserAccount user = new UserAccount();
        user.setFullName(isBlank(fullName) ? fallbackName : fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password.trim()));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
        LOGGER.info("Usuário bootstrap {} criado com e-mail {}.", role.name(), normalizedEmail);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
