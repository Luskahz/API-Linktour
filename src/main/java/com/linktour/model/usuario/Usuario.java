package com.linktour.model.usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

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

    @Email
    @Column(unique = true, nullable = false)
    private String email;


    private LocalDateTime dataCadastro = LocalDateTime.now();

    @NotBlank
    private String telefone;

    @Column(nullable = false)
    private String senhaHash;

    @NotBlank
    private String status;
}

