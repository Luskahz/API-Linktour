package com.linktour.dto.usuario.comum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComumResponseDTO {

    private Long id;
    private String cidade;
    private String email;
    private LocalDate dataCadastro;
    private String telefone;
    private String senhaHash;
    private String status;
    private String cpf;
    private String nomeCompleto;
    private String preferencias;
    private LocalDate nascimento;
    private String genero;
    private Boolean parceiro;
}
