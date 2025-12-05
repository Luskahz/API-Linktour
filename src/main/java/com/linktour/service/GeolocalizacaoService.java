package com.linktour.service;

import com.linktour.dto.NominatimResponseDTO;
import com.linktour.exception.FalhaGeolocalizacaoException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class GeolocalizacaoService {

    private final WebClient client;

    public GeolocalizacaoService(WebClient.Builder builder) {
        this.client = builder
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "linktour/1.0")
                .build();
    }

    public Double[] gerarLatLong(String endereco) {
        try {
            NominatimResponseDTO[] resposta = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .queryParam("q", endereco)
                            .build()
                    )
                    .retrieve()
                    .bodyToMono(NominatimResponseDTO[].class)
                    .block();

            if (resposta == null || resposta.length == 0) {
                throw new FalhaGeolocalizacaoException("Endereço inválido ou não encontrado");
            }

            double lat = Double.parseDouble(resposta[0].lat());
            double lon = Double.parseDouble(resposta[0].lon());

            return new Double[] { lat, lon };

        } catch (FalhaGeolocalizacaoException e) {
            throw e;
        } catch (Exception e) {
            throw new FalhaGeolocalizacaoException("Não foi possível gerar as coordenadas para o endereço informado");
        }
    }
}
