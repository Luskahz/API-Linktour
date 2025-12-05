package com.linktour.exception;

public class EventoJaIniciadoException extends RuntimeException {
    public EventoJaIniciadoException(Long eventoId) {
        super("O evento " + eventoId + " já foi iniciado.");
    }
}
