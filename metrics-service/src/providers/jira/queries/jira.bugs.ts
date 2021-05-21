import { IJiraQueryCustomField, IJiraQuery } from '../jira.types';
import { getJiraQuerySearchUrl, getPropertiesForCustomFields } from './jira.queryUtils';
import { getQuery } from '../jira.send';
import { IPoint } from 'influx';
import { logger } from '../../../shared/logger';

export async function getJiraBugs(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
    const result: IPoint[] = [];

    const urlJiraQuery = getJiraQuerySearchUrl(url, apiVersion, jiraQuery);

    let next = true;
    let startAt = 0;
    let page = 1;
    while (next){
      const queryBugsResult = await getQuery({auth: { username: authUser, password: authPass }}, urlJiraQuery.concat(`&startAt=${startAt}`));
      
      const total = queryBugsResult.data.total;
      const maxResults = queryBugsResult.data.maxResults;

      logger.info(`Retrieving: ${total} items.`);
      logger.info(`Max results: ${maxResults}.`);
      logger.info(`Start at: ${startAt}.`);

      for(const issue of queryBugsResult.data.issues){
        result.push(await map(url, apiVersion, authUser, authPass, jiraQuery, issue));
      }
      
      next = page < total / maxResults;
      page++;
      startAt += maxResults;
    }
    return result
}

async function map(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery, issue: any):Promise<IPoint> {
    const createdDate:Date = new Date(issue.fields.created);
    
    const bugWorklogTime = await calculateBugWorklogTime(url, apiVersion, authUser, authPass, issue.id);

    let register:IPoint =  {
      measurement: jiraQuery.name,
      timestamp: createdDate,
    };
    
    let deltaTimeToResolveBug = issue.fields?.resolutiondate ? (new Date(issue.fields.resolutiondate).getTime() - createdDate.getTime()) : 0;

    const ipointTags:any = {
      issueType: issue.fields.issuetype.name,
      statusCategory: issue.fields?.status?.statusCategory?.name || "Not classified",
      bugWorklogTime: bugWorklogTime || 0,
      deltaTimeToResolveBug: deltaTimeToResolveBug || 0,
    };

    const ipointFields:any = {
      issueName: issue.key,
      summary: issue.fields.summary,
      resolutionDate: issue.fields?.resolutiondate || "",
      statusCategory: issue.fields?.status?.statusCategory?.name || "Not classified",
      status: issue.fields?.status?.name || "Not classified",
      bugWorklogTime: bugWorklogTime || 0,
      deltaTimeToResolveBug: deltaTimeToResolveBug || 0,
    };

    const customFields:IJiraQueryCustomField[] = jiraQuery.customFields;
    const iPointPropertiesForCustomFields = getPropertiesForCustomFields(customFields, issue);

    register.tags = { ...ipointTags, ...iPointPropertiesForCustomFields.ipointTags };
    register.fields = {...ipointFields, ...iPointPropertiesForCustomFields.ipointFields };
    
    return register;
  }

  async function calculateBugWorklogTime(url: string, apiVersion: string, authUser: string, authPass:string, issueId: number){
    logger.info(`IssueId to get worklog: ${issueId}`);
    
    const urlJiraGetWorklog = url.concat(`/rest/api/${apiVersion}/issue/${issueId}/worklog`);
    const queryWorklogResult = await getQuery({auth: { username: authUser, password: authPass }}, urlJiraGetWorklog);
  
    logger.info(`Retrieving: ${queryWorklogResult.data.total} worklog items.`);
  
    let totalTimespent = 0;
    for(const worklog of queryWorklogResult.data?.worklogs){
      totalTimespent += worklog.timeSpentSeconds;
    }
    return totalTimespent;
  }