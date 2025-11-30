package com.linktour.dto.linktour;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LinktourPromoverDTO(
        @NotNull Long idUsuario,
        @NotBlank String status
) {}
