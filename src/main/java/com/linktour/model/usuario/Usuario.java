package com.linktour.model.usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "usuario")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String cidade;

    @Column(unique = true, nullable = false) @Email
    private String email;

    @NotNull @NotBlank
    private LocalDate dataCadastro;

    @NotBlank
    private String telefone;

    @Column(nullable = false)
    private String senhaHash;

    @NotBlank
    private String status;

    private float avgAvaliacao;

    private LocalDate ultimoLogin;
}
