package com.ciandt.metrics_config.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@Table(name = "metricconfig")
public class MetricConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "meta", columnDefinition = "json")
    private String meta;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private MetricTypeEnum provider;

    public MetricConfig(String name, MetricTypeEnum provider, String meta) {
        this.name = name;
        this.meta = meta;
        this.provider = provider;
    }

    public MetricConfig() {
    }
}
