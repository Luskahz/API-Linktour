package com.linktour.exception;

public class CPFDuplicadoException extends RuntimeException {
    public CPFDuplicadoException(String cpf) {
        super("O CPF " + cpf + " já está cadastrado.");
    }
}