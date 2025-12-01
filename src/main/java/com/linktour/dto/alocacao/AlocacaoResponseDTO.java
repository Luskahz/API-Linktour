    package com.linktour.dto.alocacao;

    public record AlocacaoResponseDTO(
            Long id,
            Long idUsuario,
            Double latitude,
            Double longitude,
            String nome,
            String descricao,
            Integer lotacao,
            String url_documentacao,
            String url_fachada
    ) {}

