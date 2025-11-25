package com.linktour.controller;

import com.linktour.dto.linktour.LinktourPromoverDTO;
import com.linktour.dto.linktour.LinktourResponseDTO;
import com.linktour.mapper.LinktourMapper;
import com.linktour.model.usuario.Linktour;
import com.linktour.service.LinktourService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/linktour")
public class LinktourController {

    private final LinktourService linktourService;

    public LinktourController(LinktourService linktourService) {
        this.linktourService = linktourService;
    }

    @PostMapping("/promover")
    public LinktourResponseDTO promover(@RequestBody LinktourPromoverDTO dto) {
        Linktour linktour = linktourService.promover(dto);
        return LinktourMapper.toResponse(linktour);
    }

    @DeleteMapping("/{registro}/revogar")
    public ResponseEntity<Void> revogar(@PathVariable Long idUsuario) {
        linktourService.revogar(idUsuario);
        return ResponseEntity.noContent().build();
    }
}
