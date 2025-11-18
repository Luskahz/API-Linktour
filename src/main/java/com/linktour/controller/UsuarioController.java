package com.linktour.controller;

import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Linktour;
import com.linktour.model.usuario.Usuario;
import com.linktour.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // =============================
    // CADASTRO DE USUÁRIO COMUM
    // =============================
    @PostMapping("/comum")
    public Usuario cadastrarComum(@RequestBody Comum comum) {
        return usuarioService.cadastrarComum(comum);
    }

    // =============================
    // LOGIN
    // =============================
    @PostMapping("/login")
    public Usuario login(@RequestBody Map<String, String> json) {
        String email = json.get("email");
        String senha = json.get("senha");
        return usuarioService.login(email, senha);
    }

    // =============================
    // PROMOVER USUÁRIO PARA LINKTOUR
    // =============================
    @PostMapping("/{id}/promover")
    public Linktour promover(@PathVariable Long id, @RequestBody Map<String, Integer> json) {

        int registro = json.get("registro");
        return usuarioService.promoverParaLinktour(id, registro);
    }

    // =============================
    // LISTAR TODOS OS USUÁRIOS
    // =============================
    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }

    // =============================
    // BUSCAR POR ID
    // =============================
    @GetMapping("/{id}")
    public Usuario buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    // =============================
    // DELETAR USUÁRIO
    // =============================
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
    }
}
