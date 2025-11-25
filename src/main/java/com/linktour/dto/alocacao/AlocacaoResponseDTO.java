package com.linktour.dto.alocacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlocacaoResponseDTO {

    private Long id;
    private Double latitude;
    private Double longitude;
    private String nome;
    private String descricao;
    private Integer lotacao;
    private String url_documentacao;
    private String url_fachada;
}
