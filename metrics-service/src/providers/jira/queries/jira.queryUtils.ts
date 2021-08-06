import { fieldsByQueryType } from './jira.queryTypes';
import { IJiraQueryCustomField, IJiraQueryResposeSprint, IJiraQuery } from '../jira.types';
import { logger } from '../../../shared/logger';

export function getJiraQuerySearchUrl(url:String, apiVersion: string, jiraQuery: IJiraQuery){
    let urlJiraQuery = url.concat(`/rest/api/${apiVersion}/search?jql=${encodeURI(jiraQuery.filter)}`);
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
            //Some Jira projects come with sprint field as string, and some come as json object,
            //that's why we need to check and adapt them as a standard (json object).
            if (issue.fields[field.key] && (typeof issue.fields[field.key][0]) == 'string'){
                issue.fields[field.key] = getSprintFieldFromStringToJson(issue.fields[field.key]);
            }
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
    return {
        "ipointTags": ipointTags,
        "ipointFields": ipointFields
    };
}

function getSprintFieldFromStringToJson( sprintFieldArr:string){
      var sprintField = "";
      var json = [];
      for (var i = 0; i < sprintFieldArr.length; i++) {
              sprintField = sprintFieldArr[i].split("[").slice(1).join("[");
              sprintField = sprintField.replace(/=/g, '": "') ;
              sprintField = sprintField.replace(/,/g, '","') ;
              sprintField = "\"" + sprintField + "\"";
              sprintField = sprintField.replace(/"id/g, '{\"id') ;
              sprintField = sprintField.split (",\"goal")[0];
              sprintField = sprintField + "},";
              sprintField = sprintField.substr(0,sprintField.length-1);
              sprintField = sprintField.replace(/(\r\n|\n|\r)/gm, "");
              json.push (JSON.parse (sprintField));
      }
      return json;
}