package com.linktour.model.usuario;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cidade;

    @Column(unique = true, nullable = false)
    private String email;

    private LocalDate dataCadastro;
    private String telefone;

    @Column(nullable = false)
    private String senhaHash;

    private String status;
    private float avgAvaliacao;
    private LocalDate ultimoLogin;

    public Usuario() {}

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDate dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public float getAvgAvaliacao() {
        return avgAvaliacao;
    }

    public void setAvgAvaliacao(float avgAvaliacao) {
        this.avgAvaliacao = avgAvaliacao;
    }

    public LocalDate getUltimoLogin() {
        return ultimoLogin;
    }

    public void setUltimoLogin(LocalDate ultimoLogin) {
        this.ultimoLogin = ultimoLogin;
    }
}
