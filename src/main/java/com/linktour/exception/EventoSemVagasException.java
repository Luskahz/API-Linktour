package com.linktour.exception;


public class EventoSemVagasException extends RuntimeException {

    public EventoSemVagasException(Long eventoId) {
        super("O evento " + eventoId + " não possui vagas disponíveis.");
    }
}
