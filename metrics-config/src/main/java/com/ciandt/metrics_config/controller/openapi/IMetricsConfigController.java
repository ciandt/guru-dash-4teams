package com.ciandt.metrics_config.controller.openapi;

import org.springframework.http.ResponseEntity;

import com.ciandt.metrics_config.request.MetricConfigRequest;
import com.ciandt.metrics_config.response.MetricConfigResponse;
import com.ciandt.metrics_config.response.ResponseErroPadrao;

import io.swagger.annotations.Api;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

@Api(tags = "Validação da autorização de uma transação de entrada")
public interface IMetricsConfigController {

        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Retorno com o resultado da tentativa de criar uma nova configuração de métrica", content = @Content(schema = @Schema(implementation = MetricConfigResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Request inválido.", content = @Content(schema = @Schema(implementation = ResponseErroPadrao.class))),
                        @ApiResponse(responseCode = "500", description = "Erro inesperado durante o processamento.", content = @Content(schema = @Schema(implementation = ResponseErroPadrao.class)))
        })
        @Operation(summary = "Cria uma nova configuração de métrica")
        public ResponseEntity<MetricConfigResponse> novaMetrica(
                        @RequestBody(required = true, description = "Dados da nova configuração de métrica") MetricConfigRequest request);

}
