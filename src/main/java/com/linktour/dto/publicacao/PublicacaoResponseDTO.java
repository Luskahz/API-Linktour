package com.linktour.dto.publicacao;

import java.time.LocalDateTime;

public record PublicacaoResponseDTO(
        Long id,
        Long idUsuario,
        LocalDateTime dataCriacao,
        String titulo,
        String descricao
) {}
