package com.linktour.dto.linktour;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinkTourAtualizarDTO {
    private String Status;
    private Long idUsuario;

}
