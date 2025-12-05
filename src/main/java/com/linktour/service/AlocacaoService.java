package com.linktour.service;

import com.linktour.dto.alocacao.AlocacaoAtualizarDTO;
import com.linktour.dto.alocacao.AlocacaoCreateDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.AlocacaoMapper;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.alocacao.AlocacaoRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlocacaoService {

    private final AlocacaoRepository alocacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GeolocalizacaoService geolocalizacaoService;

    public AlocacaoService(
            AlocacaoRepository alocacaoRepository,
            GeolocalizacaoService geo,
            UsuarioRepository usuarioRepository
    ) {
        this.alocacaoRepository = alocacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.geolocalizacaoService = geo;
    }

    public Alocacao criar(AlocacaoCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.idUsuario())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        Double[] latLong = geolocalizacaoService.gerarLatLong(dto.endereco());

        Alocacao a = AlocacaoMapper.toEntity(dto, usuario);
        a.setLatitude(latLong[0]);
        a.setLongitude(latLong[1]);

        return alocacaoRepository.save(a);
    }

    public List<Alocacao> listar() {
        return alocacaoRepository.findAll();
    }

    public Alocacao buscar(Long id) {
        return alocacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Alocação não encontrada"));
    }

    public void deletar(Long id) {
        if (!alocacaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Alocação não encontrada");
        }
        alocacaoRepository.deleteById(id);
    }

    public Alocacao atualizar(Long id, AlocacaoAtualizarDTO dto) {
        Alocacao existente = buscar(id);

        if (dto.latitude() != null) existente.setLatitude(dto.latitude());
        if (dto.longitude() != null) existente.setLongitude(dto.longitude());
        if (dto.nome() != null) existente.setNome(dto.nome());
        if (dto.descricao() != null) existente.setDescricao(dto.descricao());
        if (dto.lotacao() != null) existente.setLotacao(dto.lotacao());
        if (dto.url_documentacao() != null) existente.setUrl_documentacao(dto.url_documentacao());
        if (dto.url_fachada() != null) existente.setUrl_fachada(dto.url_fachada());

        return alocacaoRepository.save(existente);
    }

    public List<Alocacao> listarAlocacoesDoUsuario(Long usuarioId) {
        return alocacaoRepository.findByUsuarioId(usuarioId);
    }
}


