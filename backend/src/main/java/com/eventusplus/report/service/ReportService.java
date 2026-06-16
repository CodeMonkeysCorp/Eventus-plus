package com.eventusplus.report.service;

import com.eventusplus.report.dto.EventSummaryResponse;

public interface ReportService {

    EventSummaryResponse eventSummary(Long eventId);
}
