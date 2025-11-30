package com.linktour.mapper.publicacao;

import com.linktour.dto.publicacao.evento.EventoCreateDTO;
import com.linktour.dto.publicacao.evento.EventoResponseDTO;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;

public class EventoMapper {

    public static Evento toEntity(EventoCreateDTO dto, Usuario usuario, Alocacao alocacao) {
        Evento evento = new Evento();

        // Publicacao (classe mãe)
        evento.setUsuario(usuario);
        evento.setDataCriacao(dto.dataCriacao());
        evento.setTitulo(dto.titulo());
        evento.setDescricao(dto.descricao());

        // Evento (classe filha)
        evento.setAlocacao(alocacao);
        evento.setCapacidade(dto.capacidade());
        evento.setDataInicio(dto.dataInicio());
        evento.setDataFim(dto.dataFim());

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
