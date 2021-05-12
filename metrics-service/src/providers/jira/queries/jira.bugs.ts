import { fieldsByQueryType } from './jira.queryTypes';
import { IJiraQueryCustomField, IJiraQueryResposeSprint, IJiraQuery } from '../jira.types';
import { getQuery } from '../jira.send';
import { IPoint } from 'influx';
import { logger } from '../../../shared/logger';

export async function getJiraBugs(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
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

    const queryBugsResult = await getQuery({auth: { username: authUser, password: authPass }}, urlJiraQuery);
    
    logger.info(`Retrieving: ${queryBugsResult.data.total} items.`);

    for(const issue of queryBugsResult.data.issues){
      result.push(map(jiraQuery, issue));
    }  

    return result
}

function map(jiraQuery: IJiraQuery, issue: any):IPoint {
    let register:IPoint =  {
      measurement: jiraQuery.name,
      timestamp: new Date(issue.fields.created),
    };
    
    const ipointTags:any = {
      issueName: issue.key,
      issueType: issue.fields.issuetype.name,
    };

    const ipointFields:any = {
      summary: issue.fields.summary,
      resolutionDate: issue.fields?.resolutiondate || "",
      statusCategory: issue.fields?.status?.statusCategory?.name || "Not classified",
    };

    const customFields:IJiraQueryCustomField[] = jiraQuery.customFields;
    const hasCustomFields = customFields && customFields.length > 0;

    if(hasCustomFields){
      for(const field of customFields){
        if(field.name == 'sprint'){
          const firstSprint:IJiraQueryResposeSprint = issue.fields[field.key]?.reduce((prev:IJiraQueryResposeSprint, current:IJiraQueryResposeSprint) => (prev.id < current.id) ? prev : current);
          ipointTags[field.name] = firstSprint?.name || field.defaultValue || null;  
        } else {
          ipointTags[field.name] = issue.fields[field.key]?.value || field.defaultValue || null;
        }
      }
    }
    register.tags = ipointTags;
    register.fields = ipointFields;
    return register;
  }