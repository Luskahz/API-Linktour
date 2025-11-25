package com.linktour.mapper.usuario;

import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.comum.ComumResponseDTO;
import com.linktour.model.usuario.Comum;

public class ComumMapper {

    public static Comum toEntity(ComumCreateDTO dto) {
        Comum comum = new Comum();

        // Campos herdados de Usuario
        comum.setCidade(dto.getCidade());
        comum.setEmail(dto.getEmail());
        comum.setDataCadastro(dto.getDataCadastro());
        comum.setTelefone(dto.getTelefone());
        comum.setSenhaHash(dto.getSenhaHash());
        comum.setStatus(dto.getStatus());

        // Campos específicos de Comum
        comum.setCpf(dto.getCpf());
        comum.setNomeCompleto(dto.getNomeCompleto());
        comum.setPreferencias(dto.getPreferencias());
        comum.setNascimento(dto.getNascimento());
        comum.setGenero(dto.getGenero());
        comum.setParceiro(dto.getParceiro());

        return comum;
    }

    public static ComumResponseDTO toResponse(Comum comum) {
        ComumResponseDTO dto = new ComumResponseDTO();

        // Campos herdados de Usuario
        dto.setId(comum.getId());
        dto.setCidade(comum.getCidade());
        dto.setEmail(comum.getEmail());
        dto.setDataCadastro(comum.getDataCadastro());
        dto.setTelefone(comum.getTelefone());
        dto.setStatus(comum.getStatus());

        // Campos específicos de Comum
        dto.setCpf(comum.getCpf());
        dto.setNomeCompleto(comum.getNomeCompleto());
        dto.setPreferencias(comum.getPreferencias());
        dto.setNascimento(comum.getNascimento());
        dto.setGenero(comum.getGenero());
        dto.setParceiro(comum.getParceiro());

        return dto;
    }
}
