CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(2000),
    location VARCHAR(160) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_events PRIMARY KEY (id),
    CONSTRAINT fk_events_created_by FOREIGN KEY (created_by_user_id) REFERENCES users (id)
);

CREATE TABLE registrations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    checked_in_by_user_id BIGINT,
    status VARCHAR(30) NOT NULL,
    registered_at TIMESTAMP NOT NULL,
    checked_in_at TIMESTAMP NULL,
    certificate_issued_at TIMESTAMP NULL,
    CONSTRAINT pk_registrations PRIMARY KEY (id),
    CONSTRAINT uq_registrations_event_participant UNIQUE (event_id, participant_id),
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT fk_registrations_participant FOREIGN KEY (participant_id) REFERENCES users (id),
    CONSTRAINT fk_registrations_checked_in_by FOREIGN KEY (checked_in_by_user_id) REFERENCES users (id)
);

CREATE TABLE audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    actor_user_id BIGINT NULL,
    actor_email VARCHAR(160),
    action VARCHAR(60) NOT NULL,
    target_type VARCHAR(60) NOT NULL,
    target_id VARCHAR(60),
    details VARCHAR(500),
    ip_address VARCHAR(60),
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_registrations_event ON registrations (event_id);
CREATE INDEX idx_registrations_participant ON registrations (participant_id);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs (occurred_at);
