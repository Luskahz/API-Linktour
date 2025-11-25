package com.linktour.mapper.usuario;

import com.linktour.dto.usuario.UsuarioResponseDTO;
import com.linktour.model.usuario.Usuario;

public class usuarioMapper {
    public static UsuarioResponseDTO toResponse(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getCidade(),
                usuario.getTelefone(),
                usuario.getStatus()
        );
    }
}
