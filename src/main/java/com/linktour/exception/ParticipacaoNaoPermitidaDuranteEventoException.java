package com.linktour.exception;

public class ParticipacaoNaoPermitidaDuranteEventoException extends RuntimeException {
    public ParticipacaoNaoPermitidaDuranteEventoException(Long eventoId) {
        super("A participação não pode ser alterada durante o evento " + eventoId + ".");
    }
}
