package com.linktour.dto.alocacao;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class AlocacaoCreateDTO {

    @NotNull @NotBlank
    private double latitude;

    @NotNull @NotBlank
    private double longitude;

    @NotBlank
    private String nome;

    @NotBlank
    private String descricao;

    @NotBlank
    private int lotacao;
}
