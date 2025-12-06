package com.linktour.exception;

public class UsuarioPossuiEventosException extends RuntimeException {
    public UsuarioPossuiEventosException(Long id) {
        super("O usuário possui eventos vinculados. Exclua ou finalize os eventos antes de remover a conta. ID: " + id);
    }
}
