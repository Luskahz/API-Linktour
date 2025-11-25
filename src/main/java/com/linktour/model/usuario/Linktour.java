package com.linktour.model.usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "linktour")
public class Linktour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long registro; // PK autoincrement independente

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true, nullable = false)
    private Usuario usuario;

    @NotBlank
    private String status;
}
