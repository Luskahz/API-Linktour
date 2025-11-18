package com.linktour.service;

import com.linktour.model.alocacao.Alocacao;
import com.linktour.repository.AlocacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlocacaoService {

    @Autowired
    private AlocacaoRepository alocacaoRepository;

    public Alocacao criar(Alocacao alocacao) {
        return alocacaoRepository.save(alocacao);
    }

    public List<Alocacao> listar() {
        return alocacaoRepository.findAll();
    }

    public Alocacao buscarPorId(Long id) {
        return alocacaoRepository.findById(id).orElse(null);
    }

    public void deletar(Long id) {
        alocacaoRepository.deleteById(id);
    }
}
