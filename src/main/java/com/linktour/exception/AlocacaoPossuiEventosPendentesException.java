package com.linktour.exception;

public class AlocacaoPossuiEventosPendentesException extends RuntimeException {

    public AlocacaoPossuiEventosPendentesException(Long alocacaoId) {
        super("A alocação de ID " + alocacaoId + " não pode ser removida: existem eventos vinculados.");
    }
}
