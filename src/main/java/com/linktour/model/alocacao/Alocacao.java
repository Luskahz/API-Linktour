package com.linktour.model.alocacao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "alocacao")
@Data
@AllArgsConstructor
@NoArgsConstructor

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
}
