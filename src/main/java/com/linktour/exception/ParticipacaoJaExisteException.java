package com.linktour.exception;

public class ParticipacaoJaExisteException extends RuntimeException {
    public ParticipacaoJaExisteException(Long usuarioId, Long eventoId) {
        super("O usuário " + usuarioId + " já está inscrito no evento " + eventoId);
    }
}
