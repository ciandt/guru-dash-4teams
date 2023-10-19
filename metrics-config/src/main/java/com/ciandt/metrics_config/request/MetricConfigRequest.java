package com.ciandt.metrics_config.request;

import java.io.Serializable;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MetricConfigRequest implements Serializable {

    private String name;
    private JsonNode meta;
    private String provider;

}
