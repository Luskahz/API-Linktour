package com.linktour.dto.publicacao;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicacaoResponseDTO {
    private Long id;
    private Long idUsuario;
    private LocalDateTime dataCriacao;
    private String titulo;
    private String descricao;
}
