import { IJiraQuery } from './jira.types';
import { getJiraBugs } from "./queries/jira.bugs";
import { getJiraHours } from "./queries/jira.hours";


import {JiraProviderFunction} from "./jira.provider.types";
import {logger} from "../../shared/logger";
import { IPoint } from 'influx';

const queries: Record<string, JiraProviderFunction> = {
    BUG: getJiraBugs,
    HOUR: getJiraHours,
};

export async function jiraQueryFactory(url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) {
    const jiraQueryType:string = jiraQuery.type;
    const jiraQueryName:string = jiraQuery.name;
    const jiraQueryFunction = queries[jiraQueryType];
  
    if (!jiraQueryFunction) {
      throw new Error(`Unimplemented JIRA query type: ${jiraQueryType}`);
    }
  
    logger.info(`Executing JIRA query: ${jiraQueryName}`);
    const queryResult:IPoint[] = await jiraQueryFunction(url, apiVersion, authUser, authPass, jiraQuery);
    logger.info(`Finishing JIRA query: ${jiraQueryName}`);
  
    return queryResult;
  }
  