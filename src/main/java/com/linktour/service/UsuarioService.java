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

        usuarioRepository.findByEmail(dto.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Email já cadastrado.");
                });
        String hash = BCrypt.hashpw(dto.getSenhaHash(), BCrypt.gensalt());
        dto.setSenhaHash(hash);
        Comum comum = ComumMapper.toEntity(dto);

        return comumRepository.save(comum);
    }


    public Usuario login(LoginDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Email não encontrado"));
        if (!BCrypt.checkpw(dto.getSenha(), usuario.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta.");
        }//totalmente inseguro, mas é pura alfabetização professora! outro dia aprendemos a fazer token e sessãokkkk

        return usuario;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario buscar(Long id) {
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

