package com.linktour.controller;

import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoCreateDTO;
import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoAtualizarDTO;
import com.linktour.dto.participacao.participacaoEvento.ParticipacaoEventoResponseDTO;
import com.linktour.mapper.participacao.ParticipacaoEventoMapper;
import com.linktour.service.ParticipacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/participacoes")
public class ParticipacaoController {

    private final ParticipacaoService participacaoService;

    public ParticipacaoController(ParticipacaoService participacaoService) {
        this.participacaoService = participacaoService;
    }

    @PostMapping("/eventos/{eventoId}")
    public ParticipacaoEventoResponseDTO participar(
            @PathVariable Long eventoId,
            @RequestBody ParticipacaoEventoCreateDTO dto
    ) {
        return participacaoService.participar(eventoId, dto);
    }

    @GetMapping("/eventos")
    public List<ParticipacaoEventoResponseDTO> listar(){
        return participacaoService.listar()
                .stream()
                .map(ParticipacaoEventoMapper::toResponse)
                .toList();
    }


    @DeleteMapping("/eventos/{eventoId}")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long eventoId,
            @RequestParam Long usuarioId
    ) {
        participacaoService.cancelar(eventoId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/eventos/{eventoId}")
    public ResponseEntity<Void> atualizar(
            @PathVariable Long eventoId,
            @RequestParam Long usuarioId,
            @RequestBody ParticipacaoEventoAtualizarDTO dto
    ) {
        participacaoService.atualizar(eventoId, usuarioId, dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/eventos/{eventoId}")
    public ParticipacaoEventoResponseDTO buscar(
            @PathVariable Long eventoId,
            @RequestParam Long usuarioId
    ) {
        return participacaoService.buscar(eventoId, usuarioId);
    }
}
