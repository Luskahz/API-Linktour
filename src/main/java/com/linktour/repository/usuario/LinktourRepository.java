package com.linktour.repository.usuario;

import com.linktour.model.usuario.Linktour;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LinktourRepository extends JpaRepository<Linktour, Long> {
}
