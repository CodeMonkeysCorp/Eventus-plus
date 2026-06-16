package com.eventusplus.report.dto;

import com.eventusplus.event.model.EventStatus;

public record EventSummaryResponse(
        Long eventId,
        String title,
        EventStatus status,
        int capacity,
        long registrations,
        long checkIns,
        long remainingSpots,
        double occupancyRate
) {
}
