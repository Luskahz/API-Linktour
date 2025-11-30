package com.linktour.model.participacoes;


import com.linktour.model.publicacao.Evento;
import com.linktour.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participacaoEvento",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"usuario_id", "evento_id"})
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParticipacaoEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    private LocalDateTime dataParticipacao = LocalDateTime.now();
    private Integer nota;
    private String comentario;
    private String status = "PENDENTE";
}
