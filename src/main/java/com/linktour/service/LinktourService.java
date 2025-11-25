package com.linktour.service;

import com.linktour.dto.linktour.LinktourPromoverDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.LinktourMapper;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.usuario.LinktourRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class LinktourService {
    private final UsuarioRepository usuarioRepository;
    private final LinktourRepository linktourRepository;

    public LinktourService(
            UsuarioRepository usuarioRepository,
            LinktourRepository linktourRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.linktourRepository = linktourRepository;
    }



    public Linktour promover(LinktourPromoverDTO dto) {

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));


        Linktour linktour = LinktourMapper.toEntity(dto, usuario);

        return linktourRepository.save(linktour);
    }
    public void revogar(Long idUsuario) {

        // Buscar registro de Linktour pelo id do usuário
        Linktour link = linktourRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("Este usuário não possui permissão Linktour.")
                );
        linktourRepository.deleteById(link.getRegistro());
    }
}
