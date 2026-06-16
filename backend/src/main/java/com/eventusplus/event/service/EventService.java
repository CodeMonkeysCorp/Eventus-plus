package com.eventusplus.event.service;

import com.eventusplus.event.dto.EventRequest;
import com.eventusplus.event.dto.EventResponse;
import com.eventusplus.security.model.UserPrincipal;
import java.util.List;

public interface EventService {

    List<EventResponse> listPublicEvents();

    List<EventResponse> listAllEvents();

    EventResponse getPublishedEvent(Long eventId);

    EventResponse create(EventRequest request, UserPrincipal principal, String ipAddress);

    EventResponse update(Long eventId, EventRequest request, UserPrincipal principal, String ipAddress);

    void delete(Long eventId, UserPrincipal principal, String ipAddress);
}
