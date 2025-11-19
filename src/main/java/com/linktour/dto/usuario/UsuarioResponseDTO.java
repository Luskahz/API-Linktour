package com.linktour.dto.usuario;

public class UsuarioResponseDTO {

    private Long id;
    private String email;
    private String telefone;
    private int cidade;
    private String status;

    public UsuarioResponseDTO(Long id, String email, String telefone, int cidade, String status) {
        this.id = id;
        this.email = email;
        this.telefone = telefone;
        this.cidade = cidade;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public int getCidade() { return cidade; }
    public String getStatus() { return status; }
}
