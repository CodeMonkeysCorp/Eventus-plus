package com.eventusplus.report;

import com.eventusplus.common.exception.ResourceNotFoundException;
import com.eventusplus.event.AcademicEvent;
import com.eventusplus.event.AcademicEventRepository;
import com.eventusplus.registration.EventRegistrationRepository;
import com.eventusplus.registration.RegistrationStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final AcademicEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    public ReportService(AcademicEventRepository eventRepository, EventRegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional(readOnly = true)
    public EventSummaryResponse eventSummary(Long eventId) {
        AcademicEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));

        long registrations = registrationRepository.countByEventId(eventId);
        long checkIns = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);
        long remainingSpots = Math.max(0, event.getCapacity() - registrations);
        double occupancyRate = event.getCapacity() == 0
                ? 0
                : (registrations * 100.0) / event.getCapacity();

        return new EventSummaryResponse(
                event.getId(),
                event.getTitle(),
                event.getStatus(),
                event.getCapacity(),
                registrations,
                checkIns,
                remainingSpots,
                occupancyRate
        );
    }
}
