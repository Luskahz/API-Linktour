package com.linktour.service;

import com.linktour.dto.alocacao.AlocacaoAtualizarDTO;
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

    public Alocacao atualizar(Long id, AlocacaoAtualizarDTO dto) {
        Alocacao existente = buscar(id);

        if (dto.latitude() != null)
            existente.setLatitude(dto.latitude());

        if (dto.longitude() != null)
            existente.setLongitude(dto.longitude());

        if (dto.nome() != null)
            existente.setNome(dto.nome());

        if (dto.descricao() != null)
            existente.setDescricao(dto.descricao());

        if (dto.lotacao() != null)
            existente.setLotacao(dto.lotacao());

        if (dto.url_documentacao() != null)
            existente.setUrl_documentacao(dto.url_documentacao());

        if (dto.url_fachada() != null)
            existente.setUrl_fachada(dto.url_fachada());

        return alocacaoRepository.save(existente);
    }
}
