package com.linktour.dto.publicacao.evento;

import java.time.LocalDateTime;

public record EventoAtualizarDTO(
        Long idUsuario,
        LocalDateTime dataCriacao,
        String titulo,
        String descricao,
        Long idAlocacao,
        Integer capacidade,
        LocalDateTime dataInicio,
        LocalDateTime dataFim
) {}
