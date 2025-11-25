package com.linktour.mapper;

import com.linktour.dto.linktour.LinktourPromoverDTO;
import com.linktour.dto.linktour.LinktourResponseDTO;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;

public class LinktourMapper {

    public static Linktour toEntity(LinktourPromoverDTO dto, Usuario usuario) {
        Linktour link = new Linktour();

        link.setUsuario(usuario);
        link.setStatus(dto.getStatus());

        return link;
    }

    public static LinktourResponseDTO toResponse(Linktour link) {
        return new LinktourResponseDTO(
                link.getRegistro(),
                link.getUsuario() != null ? link.getUsuario().getId() : null,
                link.getStatus()
        );
    }
}
