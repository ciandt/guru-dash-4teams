import { IJiraMetadata } from './jira.types';
import { jiraQueryFactory } from './jira.query.factory';
import { IPoint } from 'influx';

export async function getJiraMetrics(metadata: IJiraMetadata) {
  const result: IPoint[] = [];
  const url:string = metadata.url
  const apiVersion:string = metadata.apiVersion
  const user:string = metadata.user
  const password:string = metadata.key

  for (const query of metadata.queries) {
      const queryResults:IPoint[] = await jiraQueryFactory(url, apiVersion, user, password, query);
      result.push(...queryResults);  
  }

  return result;
}
