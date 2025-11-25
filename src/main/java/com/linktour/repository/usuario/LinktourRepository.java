package com.linktour.repository.usuario;

import com.linktour.model.usuario.Linktour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinktourRepository extends JpaRepository<Linktour, Long> {
    Optional<Linktour> findByUsuarioId(Long usuarioId);
}
