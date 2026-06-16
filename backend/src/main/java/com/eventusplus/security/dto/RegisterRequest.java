package com.eventusplus.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "nome completo e obrigatorio.")
        @Size(max = 120, message = "nome completo deve ter no maximo 120 caracteres.")
        String fullName,

        @NotBlank(message = "email e obrigatorio.")
        @Email(message = "email invalido.")
        @Size(max = 160, message = "email deve ter no maximo 160 caracteres.")
        String email,

        @NotBlank(message = "senha e obrigatoria.")
        @Size(min = 8, max = 72, message = "senha deve ter entre 8 e 72 caracteres.")
        String password
) {
}
