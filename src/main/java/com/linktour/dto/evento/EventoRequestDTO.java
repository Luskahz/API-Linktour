package com.linktour.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EventoRequestDTO {
    @NotNull
    private Long idUsuario;

    @NotBlank
    private String titulo;

    @NotBlank
    private String descricao;

    @NotNull
    private LocalDate dataInicio;

    @NotNull
    private LocalDate dataFim;

    @NotNull @Positive
    private int capacidade;

    @NotNull
    private Long alocacaoId;

}
