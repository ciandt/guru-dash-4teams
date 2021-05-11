import { fieldsByQueryType } from './jira.queryTypes';
import { IJiraQuery } from '../jira.types';
import { getQuery } from '../jira.send';
import { IPoint } from 'influx';
import { logger } from '../../../shared/logger';

export async function getJiraBugs(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
    const result: IPoint[] = [];

    let urlJiraQuery = url.concat(`/rest/api/${apiVersion}/search?jql=${jiraQuery.jql}`);
    const fields = fieldsByQueryType[jiraQuery.type];
    if(fields){
        urlJiraQuery = urlJiraQuery.concat(`&fields=${fields}`);
    }

    const queryBugsResult = await getQuery({auth: { username: authUser, password: authPass }}, urlJiraQuery);
    
    logger.info(`Retrieving: ${queryBugsResult.data.total} items.`);

    for(const issue of queryBugsResult.data.issues){
      result.push(map(jiraQuery.type, jiraQuery.name, issue));
    }  

    return result
}

function map(queryType: string, queryName: string, issue: any):IPoint {
    return {
      measurement: queryName,
      tags: {
        issueName: issue.key,
      },
      fields: {
        issueType: issue.fields.issuetype.name,
        summary: issue.fields.summary,
      },
      timestamp: new Date(issue.fields.created),
    };
  }

