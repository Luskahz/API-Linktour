package com.linktour.controller;

import com.linktour.dto.usuario.*;
import com.linktour.mapper.UsuarioMapper;
import com.linktour.model.usuario.Usuario;
import com.linktour.model.usuario.Linktour;
import com.linktour.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/comum")
    public UsuarioResponseDTO cadastrarComum(@RequestBody ComumRegistrarDTO dto) {
        Usuario usuario = usuarioService.cadastrarComum(dto);
        return UsuarioMapper.toResponse(usuario);
    }

    @PostMapping("/login")
    public UsuarioResponseDTO login(@RequestBody LoginDTO dto) {
        Usuario usuario = usuarioService.login(dto.getEmail(), dto.getSenha());
        return UsuarioMapper.toResponse(usuario);
    }

    @PostMapping("/{id}/promover")
    public UsuarioResponseDTO promover(
            @PathVariable Long id,
            @RequestBody PromoverDTO dto
    ) {
        Linktour link = usuarioService.promoverParaLinktour(id, dto.getRegistro());
        return UsuarioMapper.toResponse(link);
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listarTodos()
                .stream()
                .map(UsuarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarPorId(@PathVariable Long id) {
        return UsuarioMapper.toResponse(usuarioService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
    }
}
