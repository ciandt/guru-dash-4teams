package com.ciandt.metrics_config.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciandt.metrics_config.controller.openapi.IMetricsConfigController;
import com.ciandt.metrics_config.service.MetricsConfigService;
import com.ciandt.metrics_config.request.MetricConfigRequest;
import com.ciandt.metrics_config.response.MetricConfigResponse;

@Validated
@RestController
@RequestMapping("/api/v1/metrics-config")
public class MetricsConfigController implements IMetricsConfigController {

    @Autowired
    public MetricsConfigService service;

    @PostMapping()
    @Override
    public ResponseEntity<MetricConfigResponse> novaMetrica(@RequestBody MetricConfigRequest request) {
        MetricConfigResponse r = service.salvar(request);
        return ResponseEntity.ok(r);
    }

    @GetMapping
    public ResponseEntity<List<MetricConfigResponse>> metricas() {
        List<MetricConfigResponse> metricas = service.metricas();
        return ResponseEntity.ok(metricas);
    }
}
