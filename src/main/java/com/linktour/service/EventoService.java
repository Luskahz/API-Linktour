package com.linktour.service;

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

    // Criar evento vinculando a alocação
    public Evento criar(Evento evento) {

        // valida se alocação existe
        Long idAloc = evento.getAlocacao() != null ? evento.getAlocacao().getId() : null;

        if (idAloc == null || !alocacaoRepository.existsById(idAloc)) {
            throw new RecursoNaoEncontradoException("A alocação vinculada não existe.");;
        }

        // busca a alocação real e associa
        Alocacao aloc = alocacaoRepository.findById(idAloc)
                .orElseThrow(() -> new RecursoNaoEncontradoException("A alocação não foi encontrada."));

        evento.setAlocacao(aloc);

        return eventoRepository.save(evento);
    }

    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    public Evento buscarPorId(Long id) {
        return eventoRepository.findById(id).orElse(null);
    }

    public void deletar(Long id) {
        eventoRepository.deleteById(id);
    }
}
