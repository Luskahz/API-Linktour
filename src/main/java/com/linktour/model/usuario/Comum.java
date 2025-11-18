package com.linktour.model.usuario;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "comum")
public class Comum extends Usuario {

    private String cpf;
    private String nomeCompleto;
    private String preferencias;
    private LocalDate nascimento;
    private String genero;
    private int parceiro;

    public Comum() {}

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

    public String getPreferencias() { return preferencias; }
    public void setPreferencias(String preferencias) { this.preferencias = preferencias; }

    public LocalDate getNascimento() { return nascimento; }
    public void setNascimento(LocalDate nascimento) { this.nascimento = nascimento; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public int getParceiro() { return parceiro; }
    public void setParceiro(int parceiro) { this.parceiro = parceiro; }
}
