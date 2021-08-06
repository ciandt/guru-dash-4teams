import { fieldsByQueryType } from './jira.queryTypes';
import { IJiraQueryCustomField, IJiraQueryResposeSprint, IJiraQuery } from '../jira.types';
import { logger } from '../../../shared/logger';

export function getJiraQuerySearchUrl(url:String, apiVersion: string, jiraQuery: IJiraQuery){
    let urlJiraQuery = url.concat(`/rest/api/${apiVersion}/search?jql=${encodeURIComponent(jiraQuery.filter)}`);
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

    return urlJiraQuery;
}

export function getPropertiesForCustomFields(customFields:IJiraQueryCustomField[], issue: any){
    const ipointTags:any = {};
    const ipointFields:any = {};
    const hasCustomFields = customFields && customFields.length > 0;
    if(hasCustomFields){
        for(const field of customFields){
          if(field.name == 'sprint'){

            let sprintObject = issue.fields[field.key];

            if (sprintObject){
            for  (let i=0; i < sprintObject.length; i++){
              let sprintObjectItem = sprintObject[i];
              sprintObjectItem = sprintObjectItem.toString().replace(/.*(\[.*?\])/g, '$1');
            
              const startDate = sprintObjectItem.match(/startDate=(.*?),/)[1];
              const endDate = sprintObjectItem.match(/endDate=(.*?),/)[1];
              const completeDate = sprintObjectItem.match(/completeDate=(.*?),/)[1];
              const goal = sprintObjectItem.match(/goal=(.*?)/)[1];


              sprintObjectItem = {
                id: +sprintObjectItem.match(/id=(\d+)/)[1],
                name: sprintObjectItem.match(/name=(.*?),/)[1].replace(/[\"\']/g, '').replace(/[\/"\/']/g, ''),
                state: sprintObjectItem.match(/state=(.*?),/)[1],
                rapidViewId: +sprintObjectItem.match(/rapidViewId=(\d+)/)[1],
                startDate: startDate == '<null>' ? null : new Date (startDate),
                endDate: endDate == "<null>" ? null : new Date (endDate),
                completeDate: completeDate == "<null>" ? null : new Date (completeDate),
                sequence: +sprintObjectItem.match(/sequence=(\d+)/)[1],
                goal: goal == "<null>" ? null : goal

              }
              sprintObject[i] = sprintObjectItem as IJiraQueryResposeSprint;
            }

            const firstSprint:IJiraQueryResposeSprint = sprintObject?.reduce((prev:IJiraQueryResposeSprint, current:IJiraQueryResposeSprint) => (prev.id < current.id) ? prev : current);
            const lastSprint:IJiraQueryResposeSprint = sprintObject?.reduce((prev:IJiraQueryResposeSprint, current:IJiraQueryResposeSprint) => (prev.id > current.id) ? prev : current);

            ipointTags[field.name] = firstSprint?.name || null; 
            ipointFields[field.name] = firstSprint?.name || field.defaultValue || null;
            
            ipointTags["lastSprint"] = lastSprint?.name || field.defaultValue || null;
            ipointFields["lastSprint"] = lastSprint?.name || field.defaultValue || null; 
          }
            
 
          } else {
           
            ipointTags[field.name] = issue.fields[field.key]?.value || field.defaultValue || null;
            ipointFields[field.name] = issue.fields[field.key]?.value || field.defaultValue || null;
          }
        }
    }
    return {
        "ipointTags": ipointTags,
        "ipointFields": ipointFields
    };
}