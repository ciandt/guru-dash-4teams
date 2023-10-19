package com.ciandt.metrics_config.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciandt.metrics_config.model.MetricConfig;

public interface IMetricsConfigRepository extends JpaRepository<MetricConfig, Long> {

}
