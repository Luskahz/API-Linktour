package com.linktour.service;

import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoCreateDTO;
import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoAtualizarDTO;
import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoResponseDTO;
import com.linktour.exception.EventoSemVagasException;
import com.linktour.exception.ParticipacaoJaExisteException;
import com.linktour.exception.ParticipacaoNaoPermitidaDuranteEventoException;
import com.linktour.exception.EventoJaIniciadoException;
import com.linktour.exception.EventoJaFinalizadoException;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.participacao.ParticipacaoEventoMapper;
import com.linktour.model.participacoes.ParticipacaoEvento;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.participacao.ParticipacaoRepository;
import com.linktour.repository.publicacao.EventoRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ParticipacaoService {

    private final ParticipacaoRepository participacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoRepository eventoRepository;

    public ParticipacaoService(
            ParticipacaoRepository participacaoRepository,
            UsuarioRepository usuarioRepository,
            EventoRepository eventoRepository
    ) {
        this.participacaoRepository = participacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
    }

    public ParticipacaoEventoResponseDTO participar(Long eventoId, ParticipacaoEventoCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento não encontrado"));

        LocalDateTime agora = LocalDateTime.now();

        if (agora.isAfter(evento.getDataInicio()) && agora.isBefore(evento.getDataFim())) {
            throw new EventoJaIniciadoException(eventoId);
        }

        if (agora.isAfter(evento.getDataFim())) {
            throw new EventoJaFinalizadoException(eventoId);
        }

        participacaoRepository
                .findByUsuarioIdAndEventoId(dto.usuarioId(), eventoId)
                .ifPresent(p -> { throw new ParticipacaoJaExisteException(dto.usuarioId(), eventoId); });

        if (evento.getCapacidade() != null) {
            long inscritos = participacaoRepository.countByEvento_Id(eventoId);
            if (inscritos >= evento.getCapacidade()) {
                throw new EventoSemVagasException(eventoId);
            }
        }

        ParticipacaoEvento entity = ParticipacaoEventoMapper.toEntity(dto, usuario, evento);
        entity = participacaoRepository.save(entity);

        return ParticipacaoEventoMapper.toResponse(entity);
    }

    public void cancelar(Long eventoId, Long usuarioId) {
        ParticipacaoEvento p = participacaoRepository
                .findByUsuarioIdAndEventoId(usuarioId, eventoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Participação não encontrada"));

        Evento evento = p.getEvento();
        LocalDateTime agora = LocalDateTime.now();

        if (agora.isAfter(evento.getDataFim())) {
            throw new EventoJaFinalizadoException(eventoId);
        }

        if (agora.isAfter(evento.getDataInicio()) && agora.isBefore(evento.getDataFim())) {
            throw new ParticipacaoNaoPermitidaDuranteEventoException(eventoId);
        }

        participacaoRepository.delete(p);
    }

    public void atualizar(Long eventoId, Long usuarioId, ParticipacaoEventoAtualizarDTO dto) {
        ParticipacaoEvento p = participacaoRepository
                .findByUsuarioIdAndEventoId(usuarioId, eventoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Participação não encontrada"));

        Evento evento = p.getEvento();
        LocalDateTime agora = LocalDateTime.now();

        if (agora.isAfter(evento.getDataFim())) {
            throw new EventoJaFinalizadoException(eventoId);
        }

        if (agora.isAfter(evento.getDataInicio()) && agora.isBefore(evento.getDataFim())) {
            throw new ParticipacaoNaoPermitidaDuranteEventoException(eventoId);
        }

        if (dto.nota() != null) p.setNota(dto.nota());
        if (dto.comentario() != null) p.setComentario(dto.comentario());
        if (dto.status() != null) p.setStatus(dto.status());

        participacaoRepository.save(p);
    }

    public ParticipacaoEventoResponseDTO buscar(Long eventoId, Long usuarioId) {
        ParticipacaoEvento p = participacaoRepository
                .findByUsuarioIdAndEventoId(usuarioId, eventoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Participação não encontrada"));

        return ParticipacaoEventoMapper.toResponse(p);
    }



    public List<ParticipacaoEvento> listar() {
        return participacaoRepository.findAll();
    }
}
