package com.eventusplus.event.controller;

import com.eventusplus.common.web.RequestUtils;
import com.eventusplus.event.dto.EventRequest;
import com.eventusplus.event.dto.EventResponse;
import com.eventusplus.event.service.EventService;
import com.eventusplus.security.model.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> listPublicEvents() {
        return eventService.listPublicEvents();
    }

    @GetMapping("/{eventId}")
    public EventResponse getPublishedEvent(@PathVariable Long eventId) {
        return eventService.getPublishedEvent(eventId);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EventResponse> listAllEvents() {
        return eventService.listAllEvents();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest
    ) {
        return eventService.create(request, principal, RequestUtils.resolveClientIp(httpServletRequest));
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse updateEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest
    ) {
        return eventService.update(eventId, request, principal, RequestUtils.resolveClientIp(httpServletRequest));
    }

    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest
    ) {
        eventService.delete(eventId, principal, RequestUtils.resolveClientIp(httpServletRequest));
    }
}
