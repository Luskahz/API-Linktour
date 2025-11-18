package com.linktour.service;

import com.linktour.exception.RecursoNaoEncontradoException;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;
import com.linktour.repository.ComumRepository;
import com.linktour.repository.LinktourRepository;
import com.linktour.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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


    // =============================
    // CADASTRAR USUÁRIO COMUM
    // =============================
    public Usuario cadastrarComum(Comum comum) {

        // email duplicado?
        usuarioRepository.findByEmail(comum.getEmail())
                .ifPresent(u -> { 
                    throw new RuntimeException("Email já cadastrado."); 
                });

        // preenchimentos automáticos
        comum.setDataCadastro(LocalDate.now());
        comum.setStatus("ATIVO");
        comum.setAvgAvaliacao(0);

        // senha → hash
        String hashSenha = BCrypt.hashpw(comum.getSenhaHash(), BCrypt.gensalt());
        comum.setSenhaHash(hashSenha);

        return comumRepository.save(comum);
    }


    // =============================
    // PROMOVER COMUM → LINKTOUR (ADMIN)
    // =============================
    public Linktour promoverParaLinktour(Long idUsuario, int registro) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        Linktour link = new Linktour();
        link.setRegistro(registro);

        // copia campos comuns
        link.setEmail(usuario.getEmail());
        link.setSenhaHash(usuario.getSenhaHash());
        link.setCidade(usuario.getCidade());
        link.setDataCadastro(usuario.getDataCadastro());
        link.setTelefone(usuario.getTelefone());
        link.setStatus("ADMIN");
        link.setAvgAvaliacao(usuario.getAvgAvaliacao());
        link.setUltimoLogin(usuario.getUltimoLogin());

        // salva
        return linktourRepository.save(link);
    }


    // =============================
    // LOGIN
    // =============================
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


    // =============================
    // LISTAR
    // =============================
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }


    // =============================
    // BUSCAR POR ID
    // =============================
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }


    // =============================
    // DELETAR
    // =============================
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
