package com.linktour.mapper.participacao;

import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoCreateDTO;
import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoResponseDTO;
import com.linktour.model.participacoes.ParticipacaoEvento;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.usuario.Usuario;

import java.time.LocalDateTime;

public class ParticipacaoEventoMapper {

    public static ParticipacaoEvento toEntity(
            ParticipacaoEventoCreateDTO dto,
            Usuario usuario,
            Evento evento
    ) {
        ParticipacaoEvento p = new ParticipacaoEvento();

        p.setUsuario(usuario);
        p.setEvento(evento);
        p.setDataParticipacao(LocalDateTime.now());
        p.setStatus("PENDENTE");

        return p;
    }

    public static ParticipacaoEventoResponseDTO toResponse(ParticipacaoEvento p) {
        return new ParticipacaoEventoResponseDTO(
                p.getId(),
                p.getUsuario().getId(),
                p.getEvento().getId(),
                p.getDataParticipacao(),
                p.getNota(),
                p.getComentario(),
                p.getStatus()
        );
    }
}
