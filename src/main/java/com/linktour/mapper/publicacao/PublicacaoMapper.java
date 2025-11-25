package com.linktour.mapper.publicacao;

import com.linktour.dto.publicacao.PublicacaoResponseDTO;
import com.linktour.model.publicacao.Publicacao;

public class PublicacaoMapper {
    public static PublicacaoResponseDTO toResponse(Publicacao publicacao) {
        return new PublicacaoResponseDTO(
                publicacao.getId(),
                publicacao.getUsuario() != null ? publicacao.getUsuario().getId() : null,
                publicacao.getDataCriacao(),
                publicacao.getTitulo(),
                publicacao.getDescricao()
        );
    }
}

