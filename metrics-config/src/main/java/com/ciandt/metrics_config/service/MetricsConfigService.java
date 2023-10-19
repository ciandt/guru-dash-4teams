package com.ciandt.metrics_config.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ciandt.metrics_config.model.MetricConfig;
import com.ciandt.metrics_config.model.MetricTypeEnum;
import com.ciandt.metrics_config.repository.IMetricsConfigRepository;
import com.ciandt.metrics_config.request.MetricConfigRequest;
import com.ciandt.metrics_config.response.MetricConfigResponse;

@Service
public class MetricsConfigService {

    @Autowired
    public IMetricsConfigRepository repository;

    public MetricConfigResponse salvar(MetricConfigRequest request) {
        MetricTypeEnum provider = MetricTypeEnum.getByValue(request.getProvider());
        MetricConfig metric = new MetricConfig(request.getName(), provider, request.getMeta().toString());
        metric = repository.save(metric);
        return new MetricConfigResponse(metric.getMeta(), metric.getName(), metric.getProvider().getValue());
    }

    public List<MetricConfigResponse> metricas() {
        List<MetricConfig> metricas = repository.findAll();
        List<MetricConfigResponse> retorno = metricas.stream().map(m -> {
            MetricConfigResponse r = new MetricConfigResponse(m.getMeta(), m.getName(), m.getProvider().getValue());
            return r;
        }).collect(Collectors.toList());
        return retorno;
    }
}
