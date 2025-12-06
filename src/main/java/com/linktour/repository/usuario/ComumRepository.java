package com.linktour.repository.usuario;

import com.linktour.model.usuario.Comum;
import com.linktour.model.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComumRepository extends JpaRepository<Comum, Long> {
    Optional<Usuario> findByCpf(String cpf);
}
