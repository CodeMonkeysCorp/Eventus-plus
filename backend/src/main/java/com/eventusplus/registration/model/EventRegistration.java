package com.eventusplus.registration.model;

import com.eventusplus.event.model.AcademicEvent;
import com.eventusplus.user.model.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "registrations")
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private AcademicEvent event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private UserAccount participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by_user_id")
    private UserAccount checkedInBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RegistrationStatus status;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @Column(name = "certificate_issued_at")
    private Instant certificateIssuedAt;

    @PrePersist
    void prePersist() {
        if (registeredAt == null) {
            registeredAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public AcademicEvent getEvent() {
        return event;
    }

    public void setEvent(AcademicEvent event) {
        this.event = event;
    }

    public UserAccount getParticipant() {
        return participant;
    }

    public void setParticipant(UserAccount participant) {
        this.participant = participant;
    }

    public UserAccount getCheckedInBy() {
        return checkedInBy;
    }

    public void setCheckedInBy(UserAccount checkedInBy) {
        this.checkedInBy = checkedInBy;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Instant registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Instant getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(Instant checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public Instant getCertificateIssuedAt() {
        return certificateIssuedAt;
    }

    public void setCertificateIssuedAt(Instant certificateIssuedAt) {
        this.certificateIssuedAt = certificateIssuedAt;
    }
}
