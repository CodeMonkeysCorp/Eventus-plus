package com.eventusplus.report;

import com.eventusplus.event.EventStatus;

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
