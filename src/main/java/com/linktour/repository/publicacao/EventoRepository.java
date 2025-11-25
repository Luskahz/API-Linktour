package com.linktour.repository.publicacao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.linktour.model.publicacao.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}