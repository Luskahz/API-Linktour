package com.linktour.mapper;

import com.linktour.dto.evento.EventoRequestDTO;
import com.linktour.dto.evento.EventoResponseDTO;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;

public class EventoMapper {

    public static Evento toEntity(EventoRequestDTO dto, Alocacao alocacao) {
        Evento e = new Evento();
        e.setIdUsuario(dto.getIdUsuario());
        e.setTitulo(dto.getTitulo());
        e.setDescricao(dto.getDescricao());
        e.setDataInicio(dto.getDataInicio());
        e.setDataFim(dto.getDataFim());
        e.setCapacidade(dto.getCapacidade());
        e.setAlocacao(alocacao);
        return e;
    }

    public static EventoResponseDTO toResponse(Evento e) {
        return new EventoResponseDTO(
                e.getId(),
                e.getTitulo(),
                e.getDescricao(),
                e.getDataInicio(),
                e.getDataFim(),
                e.getCapacidade(),
                e.getAlocacao() != null ? e.getAlocacao().getId() : null
        );
    }
}
