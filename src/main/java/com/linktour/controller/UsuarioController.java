package com.linktour.controller;

import com.linktour.dto.usuario.*;
import com.linktour.dto.usuario.comum.ComumAtualizarDTO;
import com.linktour.dto.usuario.comum.ComumCreateDTO;
import com.linktour.dto.usuario.comum.ComumResponseDTO;
import com.linktour.mapper.AlocacaoMapper;
import com.linktour.mapper.publicacao.EventoMapper;
import com.linktour.mapper.usuario.ComumMapper;
import com.linktour.mapper.usuario.UsuarioMapper;
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

    @PutMapping("/{id}/atualizar")
    public ComumResponseDTO atualizar(
            @PathVariable Long id,
            @RequestBody ComumAtualizarDTO dto){
        Comum comum = usuarioService.atualizarComum(id, dto);
        return ComumMapper.toResponse(comum);
    }


    @PostMapping("/login")
    public Object login(@RequestBody LoginDTO dto) {
        Usuario usuario = usuarioService.login(dto);
        return mapUsuarioToDTO(usuario);
    }
    @PostMapping("/{id}/solicitar-parceria")
    public ResponseEntity<Void> solicitarParceria(@PathVariable Long id) {
        usuarioService.solicitarParceria(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping
    public List<Object> listar() {
        return usuarioService.listar()
                .stream()
                .map(this::mapUsuarioToDTO)
                .toList();
    }


    @GetMapping("/{id}")
    public Object buscar(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscar(id);
        return mapUsuarioToDTO(usuario);
    }

    @GetMapping("/{id}/eventos")
    public List<?> listarEventosDoUsuario(@PathVariable Long id) {
        return usuarioService.listarEventosDoUsuario(id)
                .stream()
                .map(EventoMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}/alocacoes")
    public List<?> listarAlocacoesDoUsuario(@PathVariable Long id) {
        return usuarioService.listarAlocacoesDoUsuario(id)
                .stream()
                .map(AlocacaoMapper::toResponse)
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Object mapUsuarioToDTO(Usuario usuario) {

        if (usuario instanceof Comum comum) {
            return ComumMapper.toResponse(comum);
        }
        return UsuarioMapper.toResponse(usuario);
    }
}


