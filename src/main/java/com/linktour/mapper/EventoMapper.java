package com.linktour.mapper;

import com.linktour.dto.evento.EventoCreateDTO;
import com.linktour.dto.evento.EventoResponseDTO;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;

public class EventoMapper {

    public static Evento toEntity(EventoCreateDTO dto, Usuario usuario, Alocacao alocacao) {
        Evento evento = new Evento();

        // Publicacao (classe mãe)
        evento.setUsuario(usuario);
        evento.setDataCriacao(dto.getDataCriacao());
        evento.setTitulo(dto.getTitulo());
        evento.setDescricao(dto.getDescricao());

        // Evento (classe filha)
        evento.setAlocacao(alocacao);
        evento.setCapacidade(dto.getCapacidade());
        evento.setDataInicio(dto.getDataInicio());
        evento.setDataFim(dto.getDataFim());

        return evento;
    }

    public static EventoResponseDTO toResponse(Evento e) {
        return new EventoResponseDTO(
                e.getId(),
                e.getUsuario() != null ? e.getUsuario().getId() : null,
                e.getDataCriacao(),
                e.getTitulo(),
                e.getDescricao(),
                e.getAlocacao() != null ? e.getAlocacao().getId() : null,
                e.getCapacidade(),
                e.getDataInicio(),
                e.getDataFim()
        );
    }
}
