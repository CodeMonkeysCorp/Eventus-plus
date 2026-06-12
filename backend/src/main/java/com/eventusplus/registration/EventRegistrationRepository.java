package com.eventusplus.registration;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEventIdAndParticipantId(Long eventId, Long participantId);

    long countByEventId(Long eventId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<EventRegistration> findAllByParticipantIdOrderByRegisteredAtDesc(Long participantId);

    List<EventRegistration> findAllByStatusAndParticipantIdOrderByCheckedInAtDesc(RegistrationStatus status, Long participantId);

    List<EventRegistration> findAllByOrderByRegisteredAtDesc();
}
