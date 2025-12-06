package com.linktour.dto;

public record NominatimResponseDTO(
        String lat,
        String lon,
        String display_name
) {}