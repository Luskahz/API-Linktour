package com.linktour.service;

import com.linktour.dto.publicacao.evento.EventoCreateDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.exception.TamanhoAlocacaoInsuficienteException;
import com.linktour.mapper.publicacao.EventoMapper;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.participacao.ParticipacaoRepository;
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
    private final ParticipacaoRepository participacaoRepository;

    public EventoService(
            EventoRepository eventoRepository,
            AlocacaoRepository alocacaoRepository,
            UsuarioRepository usuarioRepository,
            ParticipacaoRepository participacaoRepository
    ) {
        this.eventoRepository = eventoRepository;
        this.alocacaoRepository = alocacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.participacaoRepository = participacaoRepository;
    }

    public Evento criar(EventoCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.idUsuario())
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("O usuário vinculado não existe.")
                );

        Alocacao alocacao = alocacaoRepository.findById(dto.idAlocacao())
                .orElseThrow(() ->
                        new RecursoNaoEncontradoException("A alocação vinculada não existe.")
                );

        Integer capacidadeEvento = dto.capacidade();
        Integer capacidadeAlocacao = alocacao.getLotacao();

        if (capacidadeEvento != null && capacidadeEvento > capacidadeAlocacao) {
            throw new TamanhoAlocacaoInsuficienteException(
                    alocacao.getId()
            );
        }

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

    public int calcularDisponibilidade(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento não encontrado"));

        int capacidade = evento.getCapacidade();
        long inscritos = participacaoRepository.countByEvento_Id(eventoId);

        int vagas = capacidade - (int) inscritos;
        return Math.max(vagas, 0);
    }

    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Evento não encontrado.");
        }
        eventoRepository.deleteById(id);
    }
}
