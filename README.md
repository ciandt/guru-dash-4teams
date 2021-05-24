![logo](img/logo-guru.png)

# Get Ultimate Reports Updated (G.U.R.U) Dashboard for Teams

![sonar-metrics](img/sonar-metrics.png) 
![tech-metrics](img/tech-metrics.png)
![quality-data](img/quality-data.png)

## Overview
Stack responsible for providing technical and operational metrics to be visualized in grafana.

![arquitetura](img/arquitetura.png)

#### Componentes:
- Grafana: Responsible for dashboards, the ./grafana folder has all the configuration of datasources and dashboards to upload via docker.
- Influxdb: Timeseries database for metrics, is rising via docker with no mapped volume, so when the container dies the records are reset.
- Strapi: CMS for configurations, today we have two collections, datasources and custom-metrics.
- metrics-service: Service in nodeJS, responsible for reading the configurations of the strapi, and accessing the different datasources to obtain metrics, process them and insert in influxdb, in a recurring way according to the CRON configuration in the docker-compose.

## Requirements
- Docker
- Docker Compose
- Node 12+: just for development.

## Instructions

1 - Run
```
docker-compose up
```

2 - Then it is necessary to configure datasources for application via strapi, through: http://localhost: 1337

Default access:
user: admin@techmetrics.ciandt
pass: techmetrics

3 - That done, just access the grafana at http://localhost:3000 with username and password "admin".

## Datasources
Datasources are implementations of external providers, who must make the data available through Rest APIs, currently the following providers are available:

#### Azure

[AZURE DOCS](docs/azure.md)

#### Sonar
The Meta should be configured as follows:
```
{
  "key": "123",
  "url": "URL Sonar",
  "projects": [
    "project keys"
  ],
  "metrics": [
    "tests",
    "coverage",
    "sqale_index",
    "lines",
    "complexity",
    "cognitive_complexity",
    "duplicated_lines_density",
    "duplicated_blocks",
    "code_smells",
    "new_code_smells",
    "vulnerabilities",
    "bugs",
    "sqale_debt_ratio",
    "reliability_rating",
    "security_rating",
    "sqale_rating",
    "blocker_violations",
    "critical_violations"
  ]
}
```
Provider name: sonar

These are the minimum metrics required for the solution's standard dashboards to function. If you want to import more metrics, this is allowed. Just add to the metrics list. If you want fewer metrics than standards, this is also allowed, but standard dashboards will not have all of your data loaded.

#### Strapi
The meta is empty:
```
{}
```
Provider name: strapi

### Custom Providers
New providers can be implemented, for jenkins, GOCD, Jira, among other possibilities, for that it is necessary:

Create a new provider in:
```
./metrics-service/src/providers/nome_do_provider
```
Follow sonar.provider as an example.

Then it is necessary to add it to the Record of provider.factory:
```
const providers: Record<string, ProviderFunction> = {
  azure: getAzureMetrics,
  sonar: getSonarMetrics,
  strapi: getStrapiMetrics,
  novo_provider: getNovoProviderMetrics(),
};
```

That done, it is enough that a new datasource is registered pointing to this provider within the strapi.
