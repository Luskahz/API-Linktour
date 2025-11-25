package com.linktour.controller;

import com.linktour.model.alocacao.Alocacao;
import com.linktour.service.AlocacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alocacoes")
public class AlocacaoController {

    @Autowired
    private AlocacaoService alocacaoService;

    @PostMapping
    public Alocacao criar(@RequestBody Alocacao alocacao) {
        return alocacaoService.criar(alocacao);
    }

    @GetMapping
    public List<Alocacao> listar() {
        return alocacaoService.listar();
    }

    @GetMapping("/{id}")
    public Alocacao buscarPorId(@PathVariable Long id) {
        return alocacaoService.buscar(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        alocacaoService.deletar(id);
    }
}
