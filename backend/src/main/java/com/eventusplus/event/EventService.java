package com.eventusplus.event;

import com.eventusplus.audit.AuditAction;
import com.eventusplus.audit.AuditService;
import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.registration.EventRegistrationRepository;
import com.eventusplus.security.UserPrincipal;
import com.eventusplus.user.UserAccount;
import com.eventusplus.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final AcademicEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public EventService(
            AcademicEventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listPublicEvents() {
        return eventRepository.findAllByStatusOrderByStartsAtAsc(EventStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listAllEvents() {
        return eventRepository.findAllByOrderByStartsAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getPublishedEvent(Long eventId) {
        AcademicEvent event = eventRepository.findById(eventId)
                .filter(foundEvent -> foundEvent.getStatus() == EventStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));
        return toResponse(event);
    }

    @Transactional
    public EventResponse create(EventRequest request, UserPrincipal principal, String ipAddress) {
        validateDates(request);

        UserAccount creator = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        AcademicEvent event = new AcademicEvent();
        applyRequest(event, request);
        event.setCreatedBy(creator);

        AcademicEvent savedEvent = eventRepository.save(event);
        auditService.log(
                principal,
                AuditAction.EVENT_CREATED,
                "EVENT",
                savedEvent.getId().toString(),
                "Evento criado: " + savedEvent.getTitle(),
                ipAddress
        );
        return toResponse(savedEvent);
    }

    @Transactional
    public EventResponse update(Long eventId, EventRequest request, UserPrincipal principal, String ipAddress) {
        validateDates(request);

        AcademicEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));

        applyRequest(event, request);
        AcademicEvent savedEvent = eventRepository.save(event);
        auditService.log(
                principal,
                AuditAction.EVENT_UPDATED,
                "EVENT",
                savedEvent.getId().toString(),
                "Evento atualizado: " + savedEvent.getTitle(),
                ipAddress
        );
        return toResponse(savedEvent);
    }

    @Transactional
    public void delete(Long eventId, UserPrincipal principal, String ipAddress) {
        AcademicEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));

        eventRepository.delete(event);
        auditService.log(
                principal,
                AuditAction.EVENT_DELETED,
                "EVENT",
                eventId.toString(),
                "Evento removido: " + event.getTitle(),
                ipAddress
        );
    }

    private void applyRequest(AcademicEvent event, EventRequest request) {
        event.setTitle(request.title().trim());
        event.setDescription(request.description() != null ? request.description().trim() : null);
        event.setLocation(request.location().trim());
        event.setStartsAt(request.startsAt());
        event.setEndsAt(request.endsAt());
        event.setCapacity(request.capacity());
        event.setStatus(request.status());
    }

    private void validateDates(EventRequest request) {
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new IllegalStateException("A data de término deve ser posterior à data de início.");
        }
    }

    private EventResponse toResponse(AcademicEvent event) {
        long registeredCount = registrationRepository.countByEventId(event.getId());
        return EventResponse.from(event, registeredCount);
    }
}
