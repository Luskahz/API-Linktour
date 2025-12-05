package com.linktour.mapper;

import com.linktour.dto.alocacao.AlocacaoCreateDTO;
import com.linktour.dto.alocacao.AlocacaoResponseDTO;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;
import com.linktour.service.GeolocalizacaoService;

public class AlocacaoMapper {

    public static Alocacao toEntity(AlocacaoCreateDTO dto, Usuario usuario) {
        Alocacao a = new Alocacao();
        a.setUsuario(usuario);
        a.setNome(dto.nome());
        a.setDescricao(dto.descricao());
        a.setLotacao(dto.lotacao());
        a.setUrl_documentacao(dto.url_documentacao());
        a.setUrl_fachada(dto.url_fachada());

        return a;
    }

    public static AlocacaoResponseDTO toResponse(Alocacao a) {
        return new AlocacaoResponseDTO(
                a.getId(),
                a.getUsuario() != null ? a.getUsuario().getId() : null,
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
