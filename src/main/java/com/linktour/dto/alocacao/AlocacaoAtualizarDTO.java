package com.linktour.dto.alocacao;

public record AlocacaoAtualizarDTO(
        Double latitude,
        Double longitude,
        String nome,
        String descricao,
        Integer lotacao,
        String url_documentacao,
        String url_fachada
) {}
