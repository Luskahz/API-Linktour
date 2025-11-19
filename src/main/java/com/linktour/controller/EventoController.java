package com.linktour.controller;

import com.linktour.dto.evento.EventoRequestDTO;
import com.linktour.dto.evento.EventoResponseDTO;
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

    // Criar evento
    @PostMapping
    public EventoResponseDTO criar(@RequestBody EventoRequestDTO dto) {
        Evento eventoCriado = eventoService.criar(dto);
        return EventoResponseDTOMapper.map(eventoCriado);
    }

    // Listar todos
    @GetMapping
    public List<EventoResponseDTO> listar() {
        return eventoService.listar()
                .stream()
                .map(EventoResponseDTOMapper::map)
                .toList();
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public EventoResponseDTO buscarPorId(@PathVariable Long id) {
        return EventoResponseDTOMapper.map(eventoService.buscarPorId(id));
    }

    // Deletar
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        eventoService.deletar(id);
    }
}
