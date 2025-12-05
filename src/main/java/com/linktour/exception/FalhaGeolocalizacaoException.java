package com.linktour.exception;

public class FalhaGeolocalizacaoException extends RuntimeException {
    public FalhaGeolocalizacaoException(String mensagem) {
        super(mensagem);
    }
}
