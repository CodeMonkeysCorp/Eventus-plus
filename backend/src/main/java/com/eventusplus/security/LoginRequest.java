package com.eventusplus.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "email e obrigatorio.")
        @Email(message = "email invalido.")
        @Size(max = 160, message = "email deve ter no maximo 160 caracteres.")
        String email,

        @NotBlank(message = "senha e obrigatoria.")
        @Size(max = 72, message = "senha deve ter no maximo 72 caracteres.")
        String password
) {
}
