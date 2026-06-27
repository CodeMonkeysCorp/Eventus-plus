package com.eventusplus.user.dto;

import jakarta.validation.constraints.NotNull;

public record UserStatusRequest(
        @NotNull(message = "status e obrigatorio.")
        Boolean active
) {
}
