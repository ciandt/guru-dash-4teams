import {IAzureMetadata, IAzureResponse, IAzureWIQLResponse, IAzureWorkItem} from "../azure.types";
import {logger} from "../../../shared/logger";
import axios from "axios";
import {IPoint} from "influx";

export async function getBugs(metadata: IAzureMetadata) {
  const ids = await queryBugs(metadata);
  const bugs = await getDetails(metadata, ids);
  
  return bugs.filter(filter).map(map);
}

async function queryBugs(metadata: IAzureMetadata) {
  logger.info(`Querying for bugs on Azure Devops for ${metadata.organization} - ${metadata.project}`);

  const res = await axios.post<IAzureWIQLResponse>(
    `https://dev.azure.com/${metadata.organization}/${metadata.project}/_apis/wit/wiql?api-version=6.1-preview.2`,
    { query: metadata.bugsQuery },
    { auth: { username: 'username', password: metadata.key } }
  );

  if (!res.data.workItems) {
    throw new Error(`Error querying for bugs on Azure Devops, status code: ${res.status}`);
  }

  return res.data.workItems.map(wi => wi.id);
}

async function getDetails(metadata: IAzureMetadata, ids: number[]) {
  logger.info(`Getting bugs details ids: ${ids}`);

  const res = await axios.post<IAzureResponse<IAzureWorkItem>>(
    `https://dev.azure.com/${metadata.organization}/${metadata.project}/_apis/wit/workitemsbatch?api-version=6.1-preview.1`,
    {
      ids,
      fields: [
        "System.State",
        "System.CreatedDate",
        "Microsoft.VSTS.Common.ClosedDate"
      ]
    },
    { auth: { username: 'username', password: metadata.key } }
  );

  if (!res.data.value) {
    throw new Error(`Error querying for bugs on Azure Devops, status code: ${res.status}`);
  }

  return res.data.value;
}

function filter(workItem: IAzureWorkItem): boolean {
  return !!workItem.fields["Microsoft.VSTS.Common.ClosedDate"];
}

function map(workItem: IAzureWorkItem): IPoint {
  return {
    timestamp: new Date(workItem.fields["System.CreatedDate"]),
    measurement: 'bug',
    tags: {
      provider: 'azure'
    },
    fields: {
      duration: new Date(workItem.fields["Microsoft.VSTS.Common.ClosedDate"]).getTime() - new Date(workItem.fields["System.CreatedDate"]).getTime(),
      state: workItem.fields["System.State"]
    }
  }
}
