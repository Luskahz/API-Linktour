package com.linktour.exception;

public class CPFInvalidoException extends RuntimeException {
    public CPFInvalidoException(String cpf) {
        super("O CPF " + cpf + " é inválido.");
    }
}