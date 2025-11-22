package com.linktour.dto.usuario;

import java.time.LocalDate;

public class ComumRegistrarDTO {

    private String cpf;
    private String nomeCompleto;
    private String preferencias;
    private LocalDate nascimento;
    private String genero;
    private String email;
    private String telefone;
    private String senha;
    private String cidade;

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

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
}
