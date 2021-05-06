# Devops Metrics

## Visão Geral
Stack responsável por disponibilizar métricas técnicas para que sejam visualizadas em um grafana.

![arquitetura](img/arquitetura.png)

#### Componentes:
- Grafana: Responsável pelos dashboards, a pasta ./grafana possui toda configuração de datasources e dashboards para subir via docker.
- Influxdb: Banco de dados timseries para as métricas, está subindo via docker sem volume mapeado, desse modo quando o container morre os registros são zerados.
- Strapi: CMS para configurações, hoje temos duas coleções, datasources e custom-metrics.
- metrics-service: Serviço feito em node, responsável por ler as configurações do strapi, e acessar os diferentes datasources para obter métricas, processa-las e inseri-las no influxdb, de modo recorrente conforme configuração de CRON no docker-compose.

## Requisitos
- Docker
- Docker Compose
- Node 12+: Apenas para desenvolvimento.

## Instruções

1 - Execute
```
docker-compose up
```

2 - Em seguda é necessário configurar datasources para aplicação via strapi, através de: http://localhost:1337

Acessar com usuário e senha padrões:
usuário: admin@techmetrics.ciandt
senha: techmetrics

3 - Feito isso basta acessar o grafana em http://localhost:3000 com usuário e senha "admin".

## Datasources
Os datasources são implementações de providers externos, que devem disponibilizar os dados através de APIs Rest, atualmente os seguintes providers estão disponíveis:

#### Azure
O Meta deve ser configurado da seguinte forma:
```
{
  "key": "123",
  "organization": "Organização",
  "project": "Projeto",
  "releases": [
    "Nome dos stages da pipeline que devem ser considerados como deploys"
  ],
  "bugsQuery": "WIQL para consultar bugs no Azure Devops"
}
```

As métricas suportadas são:
- build
- release
- bug

#### Sonar
O Meta deve ser configurado da seguinte forma:
```
{
  "key": "123",
  "url": "URL do Sonar",
  "projects": [
    "keys dos projetos"
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

As métricas são flexíveis, basta alterar o atributo "metrics" da configuração que a métrica será obtida do sonar, não existe nada hardcoded.

#### Strapi
O meta fica vazio:
```
{}
```

As métricas são flexíveis, basta cadastra-las na collection "CustomMetrics" do strapi que ela será obtida, não existe nada hardcoded.

### Custom Providers
Novos providers podem ser implementados, para jenkins, GOCD, Jira, entre outras possibilidades, para isso é necessário:

Criar um novo provider em:
```
./metrics-service/src/providers/nome_do_provider
```
Seguir como exemplo o sonar.provider.

Em seguida é necessário acrescenta-lo no Record de provider.factory:
```
const providers: Record<string, ProviderFunction> = {
  azure: getAzureMetrics,
  sonar: getSonarMetrics,
  strapi: getStrapiMetrics,
  novo_provider: getNovoProviderMetrics(),
};
```

Feito isso basta que um novo datasource seja cadastrado apontando para esse provider dentro do strapi.