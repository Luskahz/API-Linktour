package com.linktour.exception;

public class TamanhoAlocacaoInsuficienteException extends RuntimeException{
    public TamanhoAlocacaoInsuficienteException (Long alocacaoId){
        super("A alocacao " + alocacaoId + " não possui tamanho suficiente para o evento");
    }
}
