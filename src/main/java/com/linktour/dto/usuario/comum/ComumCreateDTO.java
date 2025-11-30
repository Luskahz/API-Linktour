package com.linktour.dto.usuario.comum;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ComumCreateDTO(
        @NotBlank String cpf,
        @NotBlank String nomeCompleto,

        @Email String email,

        @NotBlank String senhaHash,

        @NotBlank String cidade,
        @NotBlank String telefone,
        @NotBlank String preferencias,

        @NotNull LocalDate nascimento,

        @NotBlank String genero
) {}
