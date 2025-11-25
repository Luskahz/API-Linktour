package com.linktour.model.usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "comum")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Comum extends Usuario {

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
