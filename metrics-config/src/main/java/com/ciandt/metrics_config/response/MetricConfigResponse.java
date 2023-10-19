package com.ciandt.metrics_config.response;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.ciandt.metrics_config.model.MetricTypeEnum;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class MetricConfigResponse implements Serializable {

    private String name;
    private String meta;
    private String provider;

    public MetricConfigResponse(String meta, String name) {
        this.name = name;
        this.meta = meta;
    }

    public MetricConfigResponse(String meta, String name, String provider) {
        this(meta, name);
        this.provider = provider;
    }
}
