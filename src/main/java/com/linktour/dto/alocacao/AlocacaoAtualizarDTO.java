package com.linktour.dto.alocacao;

import lombok.Data;

@Data
public class AlocacaoAtualizarDTO {
    private double latitude;
    private double longitude;
    private String nome;
    private String descricao;
    private int lotacao;
}
