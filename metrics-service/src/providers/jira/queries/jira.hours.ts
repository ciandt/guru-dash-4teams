import { fieldsByQueryType } from './jira.queryTypes';
import { IJiraQueryCustomField, IJiraQueryResposeSprint, IJiraQuery } from '../jira.types';
import { getQuery } from '../jira.send';
import { IPoint } from 'influx';
import { logger } from '../../../shared/logger';

export async function getJiraHours(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
    const result: IPoint[] = [];

    let urlJiraQuery = url.concat(`/rest/api/${apiVersion}/search?jql=${jiraQuery.filter}`);
    const fields = fieldsByQueryType[jiraQuery.type];
    const customFields:IJiraQueryCustomField[] = jiraQuery.customFields;
    const hasCustomFields = customFields && customFields.length > 0;

    if(fields || hasCustomFields){
        urlJiraQuery = urlJiraQuery.concat('&fields=');
        if(fields){
          urlJiraQuery = urlJiraQuery.concat(`${fields}`);
        }
        if(hasCustomFields){
          let queryParamsCustomFields = '';
          for(const field of customFields){
            logger.info(`Custom field key: ${field.key} | Custom field name: ${field.name}`);
            queryParamsCustomFields = queryParamsCustomFields.concat(`, ${field.key}`);
          }
          urlJiraQuery = urlJiraQuery.concat(`${queryParamsCustomFields}`);
        }
    }

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
    const hasCustomFields = customFields && customFields.length > 0;

    if(hasCustomFields){
      for(const field of customFields){
        if(field.name == 'sprint'){
          const firstSprint:IJiraQueryResposeSprint = issue.fields[field.key]?.reduce((prev:IJiraQueryResposeSprint, current:IJiraQueryResposeSprint) => (prev.id < current.id) ? prev : current);
          const lastSprint:IJiraQueryResposeSprint = issue.fields[field.key]?.reduce((prev:IJiraQueryResposeSprint, current:IJiraQueryResposeSprint) => (prev.id > current.id) ? prev : current);
          ipointTags[field.name] = firstSprint?.name || field.defaultValue || null; 
          ipointFields[field.name] = firstSprint?.name || field.defaultValue || null;
          
          ipointTags["lastSprint"] = lastSprint?.name || field.defaultValue || null;
          ipointFields["lastSprint"] = lastSprint?.name || field.defaultValue || null; 
        } else {
          ipointTags[field.name] = issue.fields[field.key]?.value || field.defaultValue || null;
          ipointFields[field.name] = issue.fields[field.key]?.value || field.defaultValue || null;
        }
      }
    }
    register.tags = ipointTags;
    register.fields = ipointFields;
    return register;
  }