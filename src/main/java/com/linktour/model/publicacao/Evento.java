package com.linktour.model.publicacao;

import com.linktour.model.alocacao.Alocacao;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "evento")
public class Evento extends Publicacao {

    @ManyToOne
    @JoinColumn(name = "alocacao_id")
    private Alocacao alocacao;

    private int capacidade;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    public Evento() {}

    public Alocacao getAlocacao() {
        return alocacao;
    }

    public void setAlocacao(Alocacao alocacao) {
        this.alocacao = alocacao;
    }

    public int getCapacidade() {
        return capacidade;
    }

    public void setCapacidade(int capacidade) {
        this.capacidade = capacidade;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }
}
