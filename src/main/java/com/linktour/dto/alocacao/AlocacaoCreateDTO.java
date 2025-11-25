package com.linktour.dto.alocacao;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlocacaoCreateDTO {

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotBlank
    private String nome;

    @NotBlank
    private String descricao;

    @NotNull
    private Integer lotacao;

    private String url_documentacao;

    private String url_fachada;
}
