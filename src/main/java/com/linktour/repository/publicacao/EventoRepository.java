package com.linktour.repository.publicacao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.linktour.model.publicacao.Evento;

import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
        List<Evento> findByUsuarioId(Long usuarioId);
        boolean existsByAlocacao_Id(Long alocacaoId);

}