package com.linktour.model.alocacao;

import jakarta.persistence.*;

@Entity
@Table(name = "alocacao")
public class Alocacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double latitude;
    private double longitude;
    private String nome;
    private String descricao;
    private int lotacao;
    @Lob
    private byte[] documentacao;
    @Lob
    private byte[] fachada;

    public Alocacao() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
