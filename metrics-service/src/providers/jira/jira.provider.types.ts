import {IPoint} from "influx";
import { IJiraQuery } from './jira.types';

export type JiraProviderFunction = (url: string, apiVersion: string, authUser: string, authPass:string, jiraQuery: IJiraQuery) => Promise<IPoint[]>;
