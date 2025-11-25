package com.linktour.dto.linktour;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinktourPromoverDTO {

    @NotNull
    private Long idUsuario;

    @NotBlank
    private String Status;



}
