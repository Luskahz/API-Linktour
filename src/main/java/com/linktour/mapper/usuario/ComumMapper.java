package com.linktour.mapper.usuario;

import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.comum.ComumResponseDTO;
import com.linktour.model.usuario.Comum;

public class ComumMapper {

    public static Comum toEntity(ComumCreateDTO dto) {
        Comum comum = new Comum();

        // Campos herdados de Usuario
        comum.setCidade(dto.cidade());
        comum.setEmail(dto.email());
        comum.setTelefone(dto.telefone());
        comum.setSenhaHash(dto.senhaHash());

        // Campos específicos de Comum
        comum.setCpf(dto.cpf());
        comum.setNomeCompleto(dto.nomeCompleto());
        comum.setPreferencias(dto.preferencias());
        comum.setNascimento(dto.nascimento());
        comum.setGenero(dto.genero());

        return comum;
    }

    public static ComumResponseDTO toResponse(Comum comum) {
        return new ComumResponseDTO(
                comum.getId(),
                comum.getCidade(),
                comum.getEmail(),
                comum.getDataCadastro(),
                comum.getTelefone(),
                comum.getSenhaHash(),
                comum.getStatus(),
                comum.getCpf(),
                comum.getNomeCompleto(),
                comum.getPreferencias(),
                comum.getNascimento(),
                comum.getGenero(),
                comum.getParceiro()
        );
    }
}
