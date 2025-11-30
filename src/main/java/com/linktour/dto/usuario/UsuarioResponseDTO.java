package com.linktour.dto.usuario;

public record UsuarioResponseDTO(
        Long id,
        String email,
        String cidade,
        String telefone,
        String status
) {}
