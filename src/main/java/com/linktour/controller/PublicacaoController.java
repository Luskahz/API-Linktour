package com.linktour.controller;

import com.linktour.dto.publicacao.evento.EventoCreateDTO;
import com.linktour.dto.publicacao.evento.EventoResponseDTO;
import com.linktour.mapper.publicacao.EventoMapper;
import com.linktour.mapper.publicacao.PublicacaoMapper;
import com.linktour.model.publicacao.Evento;
import com.linktour.model.publicacao.Publicacao;
import com.linktour.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publicacoes")
public class PublicacaoController {

    private final EventoService eventoService;
    public PublicacaoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @PostMapping("/evento")
    public EventoResponseDTO criarEvento(@RequestBody EventoCreateDTO dto) {
        Evento eventoCriado = eventoService.criar(dto);
        return EventoMapper.toResponse(eventoCriado);
    }

    @GetMapping
    public List<Object> listar() {
        return eventoService.listar()
                .stream()
                .map(this::mapPublicacaoToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public Object buscar(@PathVariable Long id) {
        Evento evento = eventoService.buscar(id);
        return mapPublicacaoToDTO(evento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        eventoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/eventos/{id}/disponibilidade")
    public ResponseEntity<Integer> getDisponibilidade(@PathVariable Long id) {
        int vagas = eventoService.calcularDisponibilidade(id);
        return ResponseEntity.ok(vagas);
    }

    private Object mapPublicacaoToDTO(Publicacao publicacao) {

        if (publicacao instanceof Evento evento) {
            return EventoMapper.toResponse(evento);
        }

        return PublicacaoMapper.toResponse(publicacao);
    }
}
