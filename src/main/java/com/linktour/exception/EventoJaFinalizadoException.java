package com.linktour.exception;

public class EventoJaFinalizadoException extends RuntimeException {
    public EventoJaFinalizadoException(Long eventoId) {
        super("O evento " + eventoId + " já foi finalizado.");
    }
}
