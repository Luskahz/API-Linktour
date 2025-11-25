package com.linktour.model.publicacao;
import com.linktour.model.alocacao.Alocacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "evento")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Evento extends Publicacao {

    @ManyToOne
    @JoinColumn(name = "alocacao_id")
    private Alocacao alocacao;

    private Integer capacidade;

    @NotNull
    private LocalDate dataInicio;

    @NotNull
    private LocalDate dataFim;

}
