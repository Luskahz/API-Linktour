package com.linktour.repository.alocacao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.linktour.model.alocacao.Alocacao;

import java.util.List;

public interface AlocacaoRepository extends JpaRepository<Alocacao, Long> {
    List<Alocacao> findByUsuarioId(Long usuarioId);
}
