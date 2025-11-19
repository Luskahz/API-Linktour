package com.linktour.controller;

import com.linktour.dto.evento.EventoRequestDTO;
import com.linktour.dto.evento.EventoResponseDTO;
import com.linktour.mapper.EventoMapper;
import com.linktour.model.publicacao.Evento;
import com.linktour.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @PostMapping
    public EventoResponseDTO criar(@RequestBody EventoRequestDTO dto) {
        Evento eventoCriado = eventoService.criar(dto);
        return EventoMapper.toResponse(eventoCriado);
    }

    @GetMapping
    public List<EventoResponseDTO> listar() {
        return eventoService.listar()
                .stream()
                .map(EventoMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public EventoResponseDTO buscarPorId(@PathVariable Long id) {
        return EventoMapper.toResponse(eventoService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        eventoService.deletar(id);
    }
}
