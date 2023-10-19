package com.ciandt.metrics_config.controller.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.ciandt.metrics_config.response.ResponseErroPadrao;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final String CODIGO_SISTEMA_INDISPONIVEL = "500";
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseErroPadrao> handleExcecaoNaoMapeada(Exception ex, WebRequest request) {
        ResponseErroPadrao responseErroPadrao = new ResponseErroPadrao(
                CODIGO_SISTEMA_INDISPONIVEL,
                "Ocorreu um erro não mapeado",
                ex.getMessage());
        final String msgError = "Ocorreu um erro nao mapeado: ".concat(ex.toString());
        LOGGER.error(msgError);
        return ResponseEntity.internalServerError().body(responseErroPadrao);
    }
}
