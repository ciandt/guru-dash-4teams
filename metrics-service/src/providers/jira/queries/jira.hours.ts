import { IJiraQueryCustomField, IJiraQueryResposeSprint, IJiraQuery } from '../jira.types';
import { getJiraQuerySearchUrl, getPropertiesForCustomFields } from './jira.queryUtils';
import { getQuery } from '../jira.send';
import { IPoint } from 'influx';
import { logger } from '../../../shared/logger';

export async function getJiraHours(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
    const result: IPoint[] = [];

    const urlJiraQuery = getJiraQuerySearchUrl(url, apiVersion, jiraQuery);

    let next = true;
    let startAt = 0;
    let page = 1;
    while (next){
      const queryHoursResult = await getQuery({auth: { username: authUser, password: authPass }}, urlJiraQuery.concat(`&startAt=${startAt}`));
      
      const total = queryHoursResult.data.total;
      const maxResults = queryHoursResult.data.maxResults;

      logger.info(`Retrieving: ${total} items.`);
      logger.info(`Max results: ${maxResults}.`);
      logger.info(`Start at: ${startAt}.`);

      for(const issue of queryHoursResult.data.issues){
        result.push(map(url, apiVersion, authUser, authPass, jiraQuery, issue));
      }

      next = page < total / maxResults;
      page++;
      startAt += maxResults;
    }  
    return result
}

function map(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery, issue: any):IPoint {
    const createdDate:Date = new Date(issue.fields.created);
    
    let register:IPoint =  {
      measurement: jiraQuery.name,
      timestamp: createdDate,
    };
    
    const ipointTags:any = {
      issueType: issue.fields.issuetype.name,
      timespent: issue.fields?.timespent || 0, 
    };

    const ipointFields:any = {
      issueName: issue.key,
      summary: issue.fields.summary,
      timespent: issue.fields?.timespent || 0,
    };

    const customFields:IJiraQueryCustomField[] = jiraQuery.customFields;
    const iPointPropertiesForCustomFields = getPropertiesForCustomFields(customFields, issue);

    register.tags = { ...ipointTags, ...iPointPropertiesForCustomFields.ipointTags };
    register.fields = {...ipointFields, ...iPointPropertiesForCustomFields.ipointFields };
    
    return register;
  }