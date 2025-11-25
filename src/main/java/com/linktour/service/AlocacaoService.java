package com.linktour.service;

import com.linktour.model.alocacao.Alocacao;
import com.linktour.repository.alocacao.AlocacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlocacaoService {

    private final AlocacaoRepository alocacaoRepository;

    public AlocacaoService(AlocacaoRepository alocacaoRepository) {
        this.alocacaoRepository = alocacaoRepository;
    }

    public Alocacao criar(Alocacao alocacao) {
        return alocacaoRepository.save(alocacao);
    }

    public List<Alocacao> listar() {
        return alocacaoRepository.findAll();
    }

    public Alocacao buscar(Long id) {
        return alocacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alocação não encontrada"));
    }

    public void deletar(Long id) {
        if (!alocacaoRepository.existsById(id)) {
            throw new RuntimeException("Alocação não encontrada");
        }
        alocacaoRepository.deleteById(id);
    }
}
