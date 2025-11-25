package com.linktour.dto.linktour;
import com.linktour.model.usuario.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinktourResponseDTO {
    private Long registro; // PK autoincrement independente
    private Long idUsuario;
    private String status;
}
