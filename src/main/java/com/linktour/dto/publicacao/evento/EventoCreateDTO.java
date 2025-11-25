package com.linktour.dto.publicacao.evento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoCreateDTO {
    @NotNull
    private Long idUsuario;

    @NotNull
    private LocalDateTime dataCriacao;

    @NotBlank
    private String titulo;

    @NotBlank
    private String descricao;

    @NotNull
    private Long idAlocacao;

    private Integer capacidade;

    @NotNull
    private LocalDate dataInicio;

    @NotNull
    private LocalDate dataFim;

}
