package com.linktour.service;

import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.LoginDTO;
import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.mapper.usuario.ComumMapper;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.usuario.ComumRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ComumRepository comumRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ComumRepository comumRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comumRepository = comumRepository;
    }

    public Comum cadastrarComum(ComumCreateDTO dto) {

        usuarioRepository.findByEmail(dto.email())
                .ifPresent(u -> {
                    throw new RuntimeException("Email já cadastrado.");
                });

        String hash = BCrypt.hashpw(dto.senhaHash(), BCrypt.gensalt());

        Comum comum = ComumMapper.toEntity(dto);
        comum.setSenhaHash(hash);
        comum.setParceiro(false);
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

        comum.setStatus("SOLICITADO");
        comumRepository.save(comum);
    }

    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
