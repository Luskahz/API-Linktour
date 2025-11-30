package com.linktour.dto.usuario.comum;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ComumAtualizarDTO(
        String cidade,
        String email,
        LocalDateTime dataCadastro,
        String telefone,
        String senhaHash,
        String status,
        String cpf,
        String nomeCompleto,
        String preferencias,
        LocalDate nascimento,
        String genero,
        Boolean parceiro
) {}
