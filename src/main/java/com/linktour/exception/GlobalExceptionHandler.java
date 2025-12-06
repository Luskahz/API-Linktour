package com.linktour.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Object> resposta(String msg, int status) {
        Map<String, Object> erro = new HashMap<>();
        erro.put("mensagem", msg);
        erro.put("status", status);
        erro.put("timestamp", LocalDateTime.now());
        return ResponseEntity.status(status).body(erro);
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Object> handleNaoEncontrado(RecursoNaoEncontradoException ex) {
        return resposta(ex.getMessage(), 404);
    }

    @ExceptionHandler(TamanhoAlocacaoInsuficienteException.class)
    public ResponseEntity<Object> handleTamanhoInsuficiente(TamanhoAlocacaoInsuficienteException ex) {
        return resposta(ex.getMessage(), 422);
    }

    @ExceptionHandler(EventoSemVagasException.class)
    public ResponseEntity<Object> handleEventoCheio(EventoSemVagasException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(FalhaGeolocalizacaoException.class)
    public ResponseEntity<Object> handleFalhaGeo(FalhaGeolocalizacaoException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(ParticipacaoJaExisteException.class)
    public ResponseEntity<Object> handleParticipacaoExiste(ParticipacaoJaExisteException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<Object> handleEmailJaCadastrado(EmailJaCadastradoException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(SenhaIncorretaException.class)
    public ResponseEntity<Object> handleSenhaIncorreta(SenhaIncorretaException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(CPFInvalidoException.class)
    public ResponseEntity<Object> handleCPFInvalido(CPFInvalidoException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(CPFDuplicadoException.class)
    public ResponseEntity<Object> handleCPFDuplicado(CPFDuplicadoException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(EventoJaIniciadoException.class)
    public ResponseEntity<Object> handleEventoJaIniciado(EventoJaIniciadoException ex) {
        return resposta(ex.getMessage(), 409);
    }

    @ExceptionHandler(EventoJaFinalizadoException.class)
    public ResponseEntity<Object> handleEventoJaFinalizado(EventoJaFinalizadoException ex) {
        return resposta(ex.getMessage(), 410);
    }

    @ExceptionHandler(ParticipacaoNaoPermitidaDuranteEventoException.class)
    public ResponseEntity<Object> handleParticipacaoNaoPermitida(ParticipacaoNaoPermitidaDuranteEventoException ex) {
        return resposta(ex.getMessage(), 403);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex) {
        return resposta(ex.getMessage(), 400);
    }

    @ExceptionHandler(UsuarioPossuiEventosException.class)
    public ResponseEntity<Object> handleUsuarioPossuiEventos(UsuarioPossuiEventosException ex) {
        return resposta(ex.getMessage(), 409);
    }

    @ExceptionHandler(UsuarioPossuiParticipacoesException.class)
    public ResponseEntity<Object> handleUsuarioPossuiParticipacoes(UsuarioPossuiParticipacoesException ex) {
        return resposta(ex.getMessage(), 409);
    }
}
