package com.linktour.dto.participacao.participacaoEvento;

import java.time.LocalDateTime;

public record ParticipacaoEventoResponseDTO(
        Long id,
        Long usuarioId,
        Long eventoId,
        LocalDateTime dataParticipacao,
        Integer nota,
        String comentario,
        String status
) {}
