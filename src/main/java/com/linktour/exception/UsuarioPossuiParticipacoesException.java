package com.linktour.exception;

public class UsuarioPossuiParticipacoesException extends RuntimeException {
    public UsuarioPossuiParticipacoesException(Long id) {
        super("O usuário participa de eventos. Cancele as participações antes de remover a conta. ID: " + id);
    }
}
