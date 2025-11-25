package com.linktour.dto.usuario.comum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComumCreateDTO {


    @NotBlank
    private String cidade;

    @Email
    private String email;

    @NotNull
    private LocalDate dataCadastro;

    @NotBlank
    private String telefone;

    @NotBlank
    private String senhaHash;

    @NotBlank
    private String status;

    @NotBlank
    private String cpf;

    @NotBlank
    private String nomeCompleto;

    @NotBlank
    private String preferencias;

    @NotNull
    private LocalDate nascimento;

    @NotBlank
    private String genero;

    @NotNull
    private Boolean parceiro;

}
