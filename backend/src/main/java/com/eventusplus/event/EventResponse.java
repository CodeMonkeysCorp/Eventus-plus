package com.eventusplus.event;

import java.time.Instant;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        String location,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        Integer capacity,
        long registeredCount,
        long availableSpots,
        EventStatus status,
        String createdBy,
        Instant createdAt,
        Instant updatedAt
) {
    public static EventResponse from(AcademicEvent event, long registeredCount) {
        long availableSpots = Math.max(0, event.getCapacity() - registeredCount);
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.getCapacity(),
                registeredCount,
                availableSpots,
                event.getStatus(),
                event.getCreatedBy().getFullName(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
