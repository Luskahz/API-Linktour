package com.linktour.dto.publicacao.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record EventoCreateDTO(
        @NotNull Long idUsuario,
        @NotNull LocalDateTime dataCriacao,

        @NotBlank String titulo,
        @NotBlank String descricao,

        @NotNull Long idAlocacao,

        Integer capacidade,

        @NotNull LocalDateTime dataInicio,
        @NotNull LocalDateTime dataFim
) {}
