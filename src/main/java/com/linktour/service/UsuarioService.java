package com.linktour.service;

import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.usuario.ComumRepository;
import com.linktour.repository.usuario.LinktourRepository;
import com.linktour.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ComumRepository comumRepository;
    private final LinktourRepository linktourRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ComumRepository comumRepository,
            LinktourRepository linktourRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comumRepository = comumRepository;
        this.linktourRepository = linktourRepository;
    }

    public Usuario cadastrarComum(Comum comum) {

        // email duplicado?
        usuarioRepository.findByEmail(comum.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Email já cadastrado.");
                });

        // preencher campos padrões
        comum.setDataCadastro(LocalDate.now());
        comum.setStatus("ATIVO");
        comum.setAvgAvaliacao(0);

        // transformar senha pura em hash
        String hash = BCrypt.hashpw(comum.getSenhaHash(), BCrypt.gensalt());
        comum.setSenhaHash(hash);

        // salvar
        return comumRepository.save(comum);
    }

    public Linktour promoverParaLinktour(Long idUsuario, int registro) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Linktour link = new Linktour();

        link.setRegistro(registro);

        // Copia todos os dados base
        link.setEmail(usuario.getEmail());
        link.setSenhaHash(usuario.getSenhaHash());
        link.setCidade(usuario.getCidade());
        link.setDataCadastro(usuario.getDataCadastro());
        link.setTelefone(usuario.getTelefone());
        link.setStatus("ADM");
        link.setAvgAvaliacao(usuario.getAvgAvaliacao());
        link.setUltimoLogin(usuario.getUltimoLogin());

        // salva novo perfil
        return linktourRepository.save(link);
    }

    }

    public Usuario login(String email, String senhaPura) {

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado"));

        if (!BCrypt.checkpw(senhaPura, usuario.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta");
        }

        usuario.setUltimoLogin(LocalDate.now());
        usuarioRepository.save(usuario);

        return usuario;
    }

    }
}
