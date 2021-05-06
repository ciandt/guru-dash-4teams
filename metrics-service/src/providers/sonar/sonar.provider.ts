import { ISonarMeasure, ISonarMeasureResponse, ISonarMetadata } from './sonar.types';
import { IPoint } from 'influx';
import { logger } from '../../shared/logger';
import axios from 'axios';

export async function getSonarMetrics(metadata: ISonarMetadata) {
  const result: IPoint[] = [];

  for (const project of metadata.projects) {
    logger.info(`Getting sonar measures for: ${project}`);

    let next = true;
    let page = 1;

    while (next) {
      page > 1 && logger.debug(`Getting next page: ${page}`);
  
      const res = await axios.post<ISonarMeasureResponse>(`${metadata.url}/api/measures/search_history?component=${project}&metrics=${metadata.metrics}&p=${page}`, {}, {
        auth: { username: metadata.key, password: '' }
      });
      
      for (const measure of res.data.measures) {
        result.push(...map(project, measure));
      }
  
      next = page < res.data.paging.total / res.data.paging.pageSize;
      page++;
    }
  }

  return result;
}

function map(project: string, measure: ISonarMeasure):IPoint[] {
  return measure.history.filter(registry => !!registry.value).map(registry => ({
    measurement: measure.metric,
    tags: {
      project,
    },
    fields: {
      value: Number(registry.value) || 0,
      project: project
    },
    timestamp: new Date(registry.date),
  }));
}