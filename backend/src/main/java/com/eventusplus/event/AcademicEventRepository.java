package com.eventusplus.event;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicEventRepository extends JpaRepository<AcademicEvent, Long> {

    List<AcademicEvent> findAllByStatusOrderByStartsAtAsc(EventStatus status);

    List<AcademicEvent> findAllByOrderByStartsAtAsc();
}
