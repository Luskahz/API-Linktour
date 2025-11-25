package com.linktour.dto.evento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoAtualizarDTO {
    private Long idUsuario;
    private LocalDateTime dataCriacao;
    private String titulo;
    private String descricao;
    private Long idAlocacao;
    private Integer capacidade;
    private LocalDate dataInicio;
    private LocalDate dataFim;
}
