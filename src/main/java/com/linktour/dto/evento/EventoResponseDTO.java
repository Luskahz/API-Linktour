package com.linktour.dto.evento;

import java.time.LocalDate;

public class EventoResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private int capacidade;
    private Long alocacaoId;

    public EventoResponseDTO(Long id, String titulo, String descricao,
                             LocalDate dataInicio, LocalDate dataFim,
                             int capacidade, Long alocacaoId) {

        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.capacidade = capacidade;
        this.alocacaoId = alocacaoId;
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public LocalDate getDataInicio() { return dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public int getCapacidade() { return capacidade; }
    public Long getAlocacaoId() { return alocacaoId; }
}
