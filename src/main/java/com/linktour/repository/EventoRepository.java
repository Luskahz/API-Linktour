package com.linktour.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.linktour.model.publicacao.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}