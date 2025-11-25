package com.linktour.controller;

import com.linktour.dto.usuario.*;
import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.comum.ComumResponseDTO;
import com.linktour.mapper.usuario.ComumMapper;
import com.linktour.mapper.usuario.usuarioMapper;
import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Usuario;
import com.linktour.service.UsuarioService;
import org.springframework.http.ResponseEntity;
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
    public ComumResponseDTO cadastrarComum(@RequestBody ComumCreateDTO dto) {
        Comum comum = usuarioService.cadastrarComum(dto);
        return ComumMapper.toResponse(comum);
    }

    @PostMapping("/login")
    public UsuarioResponseDTO login(@RequestBody LoginDTO dto) {
        Usuario usuario = usuarioService.login(dto);
        return usuarioMapper.toResponse(usuario);
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar()
                .stream()
                .map(usuarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscar(@PathVariable Long id) {
        return usuarioMapper.toResponse(usuarioService.buscar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

