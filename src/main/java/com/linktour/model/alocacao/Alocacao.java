package com.linktour.model.alocacao;
import com.linktour.model.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "alocacao")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Alocacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotBlank
    private String nome;

    @NotBlank
    private String descricao;

    @NotNull
    private Integer lotacao;

    private String url_documentacao;

    private String url_fachada;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}