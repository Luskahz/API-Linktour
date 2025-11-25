package com.linktour.controller;

import com.linktour.dto.alocacao.AlocacaoAtualizarDTO;
import com.linktour.dto.alocacao.AlocacaoCreateDTO;
import com.linktour.dto.alocacao.AlocacaoResponseDTO;
import com.linktour.mapper.AlocacaoMapper;
import com.linktour.model.alocacao.Alocacao;
import com.linktour.service.AlocacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/alocacoes")
public class AlocacaoController {

    private final AlocacaoService alocacaoService;
    public AlocacaoController(AlocacaoService alocacaoService) {
        this.alocacaoService = alocacaoService;
    }

    @PostMapping
    public ResponseEntity<AlocacaoResponseDTO> criar(@RequestBody AlocacaoCreateDTO dto) {
        Alocacao alocacao = AlocacaoMapper.toEntity(dto);
        Alocacao criada = alocacaoService.criar(alocacao);
        return ResponseEntity.ok(AlocacaoMapper.toResponse(criada));
    }

    @GetMapping
    public List<AlocacaoResponseDTO> listar() {
        return alocacaoService.listar()
                .stream()
                .map(AlocacaoMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlocacaoResponseDTO> buscar(@PathVariable Long id) {
        Alocacao alocacao = alocacaoService.buscar(id);
        return ResponseEntity.ok(AlocacaoMapper.toResponse(alocacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        alocacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlocacaoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody AlocacaoAtualizarDTO dto
    ) {
        Alocacao atualizado = alocacaoService.atualizar(id, dto);
        return ResponseEntity.ok(AlocacaoMapper.toResponse(atualizado));
    }
}
