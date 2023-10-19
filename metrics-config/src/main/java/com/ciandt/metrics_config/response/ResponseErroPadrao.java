package com.ciandt.metrics_config.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseErroPadrao {

    private String codigoErro;

    private String descricaoAmigavel;

    private String descricaoTecnica;
}
