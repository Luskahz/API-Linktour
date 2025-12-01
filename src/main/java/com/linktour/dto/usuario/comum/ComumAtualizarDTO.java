package com.linktour.dto.usuario.comum;

import java.time.LocalDate;

public record ComumAtualizarDTO(
        String cidade,
        String email,
        String telefone,
        String cpf,
        String nomeCompleto,
        String preferencias,
        LocalDate nascimento,
        String genero
) {}
