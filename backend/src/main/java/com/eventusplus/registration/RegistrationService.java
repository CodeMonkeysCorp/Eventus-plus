package com.eventusplus.registration;

import com.eventusplus.audit.AuditAction;
import com.eventusplus.audit.AuditService;
import com.eventusplus.certificate.CertificateResponse;
import com.eventusplus.common.exception.ConflictException;
import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.event.AcademicEvent;
import com.eventusplus.event.AcademicEventRepository;
import com.eventusplus.event.EventStatus;
import com.eventusplus.security.UserPrincipal;
import com.eventusplus.user.UserAccount;
import com.eventusplus.user.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final AcademicEventRepository eventRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public RegistrationService(
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

    @Transactional
    public RegistrationResponse registerForEvent(Long eventId, UserPrincipal principal, String ipAddress) {
        UserAccount participant = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        AcademicEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ConflictException("Apenas eventos publicados podem receber inscrições.");
        }
        if (registrationRepository.existsByEventIdAndParticipantId(eventId, participant.getId())) {
            throw new ConflictException("O participante já está inscrito neste evento.");
        }
        if (registrationRepository.countByEventId(eventId) >= event.getCapacity()) {
            throw new ConflictException("Não há mais vagas disponíveis para este evento.");
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
                "Inscrição criada no evento " + event.getTitle(),
                ipAddress
        );
        return RegistrationResponse.from(savedRegistration);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> listMyRegistrations(UserPrincipal principal) {
        return registrationRepository.findAllByParticipantIdOrderByRegisteredAtDesc(principal.id())
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> listAllRegistrations() {
        return registrationRepository.findAllByOrderByRegisteredAtDesc()
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Transactional
    public RegistrationResponse checkIn(Long registrationId, UserPrincipal principal, String ipAddress) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscrição não encontrada."));
        UserAccount operator = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (registration.getStatus() == RegistrationStatus.CHECKED_IN) {
            throw new ConflictException("O participante já realizou check-in.");
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

    @Transactional(readOnly = true)
    public List<CertificateResponse> listMyCertificates(UserPrincipal principal) {
        return registrationRepository.findAllByStatusAndParticipantIdOrderByCheckedInAtDesc(RegistrationStatus.CHECKED_IN, principal.id())
                .stream()
                .map(CertificateResponse::from)
                .toList();
    }
}
