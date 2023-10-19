package com.ciandt.metrics_config.model;

import java.util.concurrent.ConcurrentHashMap;

public enum MetricTypeEnum {

    SONAR("sonar"), JIRA("jira"), BAMBOO("bamboo"), BITBUCKET("bitbucket"), OCTANE("octane");

    private MetricTypeEnum(String value) {
        this.value = value;
    }

    private String value;
    private static java.util.Map<String, MetricTypeEnum> map = new ConcurrentHashMap<>();
    static {
        for (MetricTypeEnum e : MetricTypeEnum.values()) {
            map.put(e.value, e);
        }

    }

    public static MetricTypeEnum getByValue(String value) {
        return map.get(value);
    }

    public String getValue() {
        return this.value;
    }
}
