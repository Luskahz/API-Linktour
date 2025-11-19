package com.linktour.controller;

import com.linktour.dto.evento.EventoResponseDTO;
import com.linktour.model.publicacao.Evento;

public class EventoResponseDTOMapper {

    public static EventoResponseDTO map(Evento evento) {
        return new EventoResponseDTO(
                evento.getId(),
                evento.getTitulo(),
                evento.getDescricao(),
                evento.getDataInicio(),
                evento.getDataFim(),
                evento.getCapacidade(),
                evento.getAlocacao() != null ? evento.getAlocacao().getId() : null
        );
    }
}
