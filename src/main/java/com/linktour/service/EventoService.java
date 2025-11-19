package com.linktour.service;

import com.linktour.dto.evento.EventoRequestDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.repository.EventoRepository;
import com.linktour.repository.AlocacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private AlocacaoRepository alocacaoRepository;

    public Evento criar(EventoRequestDTO dto) {

        // verificar alocação
        Alocacao aloc = alocacaoRepository.findById(dto.getAlocacaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("A alocação vinculada não existe."));

        // montar entidade
        Evento evento = new Evento();
        evento.setTitulo(dto.getTitulo());
        evento.setDescricao(dto.getDescricao());
        evento.setCapacidade(dto.getCapacidade());
        evento.setDataInicio(dto.getDataInicio());
        evento.setDataFim(dto.getDataFim());
        evento.setAlocacao(aloc);

        return eventoRepository.save(evento);
    }

    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    public Evento buscarPorId(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento não encontrado"));
    }

    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Evento não encontrado");
        }
        eventoRepository.deleteById(id);
    }
}
