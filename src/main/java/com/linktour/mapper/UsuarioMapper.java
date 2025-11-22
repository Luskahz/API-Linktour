package com.linktour.mapper;

import com.linktour.dto.usuario.ComumRegistrarDTO;
import com.linktour.dto.usuario.UsuarioResponseDTO;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Usuario;

public class UsuarioMapper {

    public static Comum toComumEntity(ComumRegistrarDTO dto, String senhaHash) {
        Comum c = new Comum();
        c.setCpf(dto.getCpf());
        c.setNomeCompleto(dto.getNomeCompleto());
        c.setPreferencias(dto.getPreferencias());
        c.setNascimento(dto.getNascimento());
        c.setGenero(dto.getGenero());

        c.setEmail(dto.getEmail());
        c.setTelefone(dto.getTelefone());
        c.setCidade(dto.getCidade());
        c.setSenhaHash(senhaHash);

        return c;
    }

    public static UsuarioResponseDTO toResponse(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getEmail(),
                u.getTelefone(),
                u.getCidade(),
                u.getStatus()
        );
    }
}
