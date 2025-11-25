package com.linktour.mapper;


import com.linktour.dto.alocacao.AlocacaoCreateDTO;
import com.linktour.dto.alocacao.AlocacaoResponseDTO;
import com.linktour.model.alocacao.Alocacao;

public class AlocacaoMapper {

    public static Alocacao toEntity(AlocacaoCreateDTO dto) {
        Alocacao a = new Alocacao();

        a.setLatitude(dto.getLatitude());
        a.setLongitude(dto.getLongitude());
        a.setNome(dto.getNome());
        a.setDescricao(dto.getDescricao());
        a.setLotacao(dto.getLotacao());
        a.setUrl_documentacao(dto.getUrl_documentacao());
        a.setUrl_fachada(dto.getUrl_fachada());

        return a;
    }

    public static AlocacaoResponseDTO toResponse(Alocacao a) {
        return new AlocacaoResponseDTO(
                a.getId(),
                a.getLatitude(),
                a.getLongitude(),
                a.getNome(),
                a.getDescricao(),
                a.getLotacao(),
                a.getUrl_documentacao(),
                a.getUrl_fachada()
        );
    }
}
