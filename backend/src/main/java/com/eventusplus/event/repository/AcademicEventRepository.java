package com.eventusplus.event.repository;

import com.eventusplus.event.model.AcademicEvent;
import com.eventusplus.event.model.EventStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicEventRepository extends JpaRepository<AcademicEvent, Long> {

    List<AcademicEvent> findAllByStatusOrderByStartsAtAsc(EventStatus status);

    List<AcademicEvent> findAllByOrderByStartsAtAsc();
}
