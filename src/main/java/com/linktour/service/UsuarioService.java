package com.linktour.service;

import com.linktour.dto.usuario.comum.ComumAtualizarDTO;
import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.LoginDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.usuario.ComumMapper;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.alocacao.AlocacaoRepository;
import com.linktour.repository.usuario.ComumRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import com.linktour.repository.publicacao.EventoRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ComumRepository comumRepository;
    private final EventoRepository eventoRepository;
    private final AlocacaoRepository alocacaoRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ComumRepository comumRepository,
            EventoRepository eventoRepository,
            AlocacaoRepository alocacaoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comumRepository = comumRepository;
        this.eventoRepository = eventoRepository;
        this.alocacaoRepository = alocacaoRepository;
    }

    public Comum cadastrarComum(ComumCreateDTO dto) {

        usuarioRepository.findByEmail(dto.email())
                .ifPresent(u -> {
                    throw new RuntimeException("Email já cadastrado.");
                });

        String hash = BCrypt.hashpw(dto.senhaHash(), BCrypt.gensalt());

        Comum comum = ComumMapper.toEntity(dto);
        comum.setSenhaHash(hash);
        comum.setParceiro("");
        comum.setStatus("ATIVO");
        comum.setDataCadastro(LocalDateTime.now());

        return comumRepository.save(comum);
    }

    public Usuario login(LoginDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Email não encontrado"));

        if (!BCrypt.checkpw(dto.senha(), usuario.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta.");
        }

        return usuario;
    }

    public List<Evento> listarEventosDoUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        return eventoRepository.findByUsuarioId(usuario.getId());
    }

    public List<Alocacao> listarAlocacoesDoUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        return alocacaoRepository.findByUsuarioId(usuario.getId());
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public void solicitarParceria(Long id) {
        Comum comum = comumRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        comum.setParceiro("SOLICITADO");
        comumRepository.save(comum);
    }

    public Comum atualizarComum(Long id, ComumAtualizarDTO dto){

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!(usuario instanceof Comum comum)) {
            throw new RuntimeException("Este usuário não é do tipo Comum.");
        }

        if (dto.nomeCompleto() != null && !dto.nomeCompleto().isBlank())
            comum.setNomeCompleto(dto.nomeCompleto());

        if (dto.cidade() != null && !dto.cidade().isBlank())
            comum.setCidade(dto.cidade());

        if (dto.telefone() != null && !dto.telefone().isBlank())
            comum.setTelefone(dto.telefone());

        if (dto.email() != null && !dto.email().isBlank()) {

            // aqui eu garanto que o email se mantem unico
            usuarioRepository.findByEmail(dto.email())
                    .ifPresent(u -> {
                        if (!u.getId().equals(id)) {
                            throw new RuntimeException("Email já está em uso.");
                        }
                    });

            comum.setEmail(dto.email());
        }

        if (dto.cpf() != null && !dto.cpf().isBlank())
            comum.setCpf(dto.cpf());

        if (dto.preferencias() != null)
            comum.setPreferencias(dto.preferencias());

        if (dto.nascimento() != null)
            comum.setNascimento(dto.nascimento());

        if (dto.genero() != null)
            comum.setGenero(dto.genero());

        return comumRepository.save(comum);
    }



    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
