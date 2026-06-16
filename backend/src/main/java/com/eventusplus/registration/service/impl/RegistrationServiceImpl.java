package com.eventusplus.registration.service.impl;

import com.eventusplus.audit.model.AuditAction;
import com.eventusplus.audit.service.AuditService;
import com.eventusplus.certificate.dto.CertificateResponse;
import com.eventusplus.common.exception.ConflictException;
import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.event.model.AcademicEvent;
import com.eventusplus.event.model.EventStatus;
import com.eventusplus.event.repository.AcademicEventRepository;
import com.eventusplus.registration.model.EventRegistration;
import com.eventusplus.registration.dto.RegistrationResponse;
import com.eventusplus.registration.repository.EventRegistrationRepository;
import com.eventusplus.registration.service.RegistrationService;
import com.eventusplus.registration.model.RegistrationStatus;
import com.eventusplus.security.model.UserPrincipal;
import com.eventusplus.user.model.UserAccount;
import com.eventusplus.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final AcademicEventRepository eventRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public RegistrationServiceImpl(
            EventRegistrationRepository registrationRepository,
            AcademicEventRepository eventRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public RegistrationResponse registerForEvent(Long eventId, UserPrincipal principal, String ipAddress) {
        UserAccount participant = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃ¡rio nÃ£o encontrado."));
        AcademicEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento nÃ£o encontrado."));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ConflictException("Apenas eventos publicados podem receber inscriÃ§Ãµes.");
        }
        if (registrationRepository.existsByEventIdAndParticipantId(eventId, participant.getId())) {
            throw new ConflictException("O participante jÃ¡ estÃ¡ inscrito neste evento.");
        }
        if (registrationRepository.countByEventId(eventId) >= event.getCapacity()) {
            throw new ConflictException("NÃ£o hÃ¡ mais vagas disponÃ­veis para este evento.");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setParticipant(participant);
        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setRegisteredAt(Instant.now());

        EventRegistration savedRegistration = registrationRepository.save(registration);
        auditService.log(
                principal,
                AuditAction.REGISTRATION_CREATED,
                "REGISTRATION",
                savedRegistration.getId().toString(),
                "InscriÃ§Ã£o criada no evento " + event.getTitle(),
                ipAddress
        );
        return RegistrationResponse.from(savedRegistration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponse> listMyRegistrations(UserPrincipal principal) {
        return registrationRepository.findAllByParticipantIdOrderByRegisteredAtDesc(principal.id())
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponse> listAllRegistrations() {
        return registrationRepository.findAllByOrderByRegisteredAtDesc()
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public RegistrationResponse checkIn(Long registrationId, UserPrincipal principal, String ipAddress) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("InscriÃ§Ã£o nÃ£o encontrada."));
        UserAccount operator = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃ¡rio nÃ£o encontrado."));

        if (registration.getStatus() == RegistrationStatus.CHECKED_IN) {
            throw new ConflictException("O participante jÃ¡ realizou check-in.");
        }
        if (registration.getEvent().getStatus() != EventStatus.PUBLISHED) {
            throw new ConflictException("Check-in permitido apenas para eventos publicados.");
        }

        Instant now = Instant.now();
        registration.setStatus(RegistrationStatus.CHECKED_IN);
        registration.setCheckedInAt(now);
        registration.setCheckedInBy(operator);
        registration.setCertificateIssuedAt(now);

        EventRegistration savedRegistration = registrationRepository.save(registration);
        auditService.log(
                principal,
                AuditAction.CHECK_IN_CONFIRMED,
                "REGISTRATION",
                savedRegistration.getId().toString(),
                "Check-in confirmado para o evento " + registration.getEvent().getTitle(),
                ipAddress
        );
        return RegistrationResponse.from(savedRegistration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> listMyCertificates(UserPrincipal principal) {
        return registrationRepository.findAllByStatusAndParticipantIdOrderByCheckedInAtDesc(RegistrationStatus.CHECKED_IN, principal.id())
                .stream()
                .map(CertificateResponse::from)
                .toList();
    }
}
