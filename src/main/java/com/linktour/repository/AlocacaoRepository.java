package com.linktour.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.linktour.model.alocacao.Alocacao;

public interface AlocacaoRepository extends JpaRepository<Alocacao, Long> {
}
