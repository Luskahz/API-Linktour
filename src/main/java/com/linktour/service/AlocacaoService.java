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

        if (dto.getLatitude() != null)
            existente.setLatitude(dto.getLatitude());

        if (dto.getLongitude() != null)
            existente.setLongitude(dto.getLongitude());

        if (dto.getNome() != null)
            existente.setNome(dto.getNome());

        if (dto.getDescricao() != null)
            existente.setDescricao(dto.getDescricao());

        if (dto.getLotacao() != null)
            existente.setLotacao(dto.getLotacao());

        if (dto.getUrl_documentacao() != null)
            existente.setUrl_documentacao(dto.getUrl_documentacao());

        if (dto.getUrl_fachada() != null)
            existente.setUrl_fachada(dto.getUrl_fachada());

        return alocacaoRepository.save(existente);
    }
}
