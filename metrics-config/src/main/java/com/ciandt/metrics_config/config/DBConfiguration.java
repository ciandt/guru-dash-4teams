package com.ciandt.metrics_config.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DBConfiguration {

    @Autowired
    private Environment env;

    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .driverClassName(env.getProperty("driverClassName"))
                .url(env.getProperty("url"))
                .username(env.getProperty("user"))
                .password(env.getProperty("password"))
                .build();
    }
}
