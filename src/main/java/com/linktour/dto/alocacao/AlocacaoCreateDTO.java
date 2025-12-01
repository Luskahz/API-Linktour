package com.linktour.dto.alocacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlocacaoCreateDTO(
        @NotNull Double latitude,
        @NotNull Double longitude,
        @NotBlank String nome,
        @NotBlank String descricao,
        @NotNull Integer lotacao,
        String url_documentacao,
        String url_fachada,
        @NotNull Long idUsuario
) {}
