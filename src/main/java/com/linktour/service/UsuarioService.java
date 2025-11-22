package com.linktour.service;

import com.linktour.dto.usuario.ComumRegistrarDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.ComumRepository;
import com.linktour.repository.LinktourRepository;
import com.linktour.repository.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ComumRepository comumRepository;
    private final LinktourRepository linktourRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          ComumRepository comumRepository,
                          LinktourRepository linktourRepository) {
        this.usuarioRepository = usuarioRepository;
        this.comumRepository = comumRepository;
        this.linktourRepository = linktourRepository;
    }

    // CADASTRAR COMUM USANDO DTO
    public Usuario cadastrarComum(ComumRegistrarDTO dto) {

        usuarioRepository.findByEmail(dto.getEmail())
                .ifPresent(u -> { throw new RuntimeException("Email já cadastrado."); });

        Comum comum = new Comum();
        comum.setCpf(dto.getCpf());
        comum.setNomeCompleto(dto.getNomeCompleto());
        comum.setPreferencias(dto.getPreferencias());
        comum.setNascimento(dto.getNascimento());
        comum.setGenero(dto.getGenero());
        comum.setCidade(dto.getCidade());
        comum.setEmail(dto.getEmail());
        comum.setTelefone(dto.getTelefone());
        comum.setStatus("ATIVO");
        comum.setDataCadastro(LocalDate.now());
        comum.setAvgAvaliacao(0);

        String hash = BCrypt.hashpw(dto.getSenha(), BCrypt.gensalt());
        comum.setSenhaHash(hash);

        return comumRepository.save(comum);
    }
    // PROMOÇÃO
    public Linktour promoverParaLinktour(Long idUsuario, int registro) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        Linktour link = new Linktour();
        link.setRegistro(registro);

        link.setEmail(usuario.getEmail());
        link.setSenhaHash(usuario.getSenhaHash());
        link.setCidade(usuario.getCidade());
        link.setDataCadastro(usuario.getDataCadastro());
        link.setTelefone(usuario.getTelefone());
        link.setStatus("ADMIN");
        link.setAvgAvaliacao(usuario.getAvgAvaliacao());
        link.setUltimoLogin(usuario.getUltimoLogin());

        return linktourRepository.save(link);
    }

    // LOGIN
    public Usuario login(String email, String senhaPura) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Email não encontrado"));

        if (!BCrypt.checkpw(senhaPura, usuario.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta.");
        }

        usuario.setUltimoLogin(LocalDate.now());
        usuarioRepository.save(usuario);

        return usuario;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
