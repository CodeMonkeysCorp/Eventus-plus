package com.eventusplus.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "titulo e obrigatorio.")
        @Size(max = 160, message = "titulo deve ter no maximo 160 caracteres.")
        String title,

        @Size(max = 2000, message = "descricao deve ter no maximo 2000 caracteres.")
        String description,

        @NotBlank(message = "local e obrigatorio.")
        @Size(max = 160, message = "local deve ter no maximo 160 caracteres.")
        String location,

        @NotNull(message = "data de inicio e obrigatoria.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime startsAt,

        @NotNull(message = "data de termino e obrigatoria.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime endsAt,

        @NotNull(message = "capacidade e obrigatoria.")
        @Min(value = 1, message = "capacidade deve ser maior que zero.")
        Integer capacity,

        @NotNull(message = "status e obrigatorio.")
        EventStatus status
) {
}
