package com.linktour.service;

import com.linktour.dto.evento.EventoCreateDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.EventoMapper;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.publicacao.EventoRepository;
import com.linktour.repository.alocacao.AlocacaoRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final AlocacaoRepository alocacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoService(
            EventoRepository eventoRepository,
            AlocacaoRepository alocacaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.eventoRepository = eventoRepository;
        this.alocacaoRepository = alocacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Evento criar(EventoCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("O usuário vinculado não existe.")
                );
        Alocacao alocacao = alocacaoRepository.findById(dto.getIdAlocacao())
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("A alocação vinculada não existe.")
                );
        Evento evento = EventoMapper.toEntity(dto, usuario, alocacao);

        return eventoRepository.save(evento);
    }

    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    public Evento buscar(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("Evento não encontrado.")
                );
    }

    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Evento não encontrado.");
        }
        eventoRepository.deleteById(id);
    }
}