import axios from 'axios';
import { IPoint } from 'influx';
import { IAzureResponse, IAzureBuild, IAzureMetadata } from '../azure.types';
import { logger } from '../../../shared/logger';

export async function getBuilds(metadata: IAzureMetadata) {
  logger.info(`Getting Build Information from Azure Devops for ${metadata.organization} - ${metadata.project}`);

  const res = await axios.get<IAzureResponse<IAzureBuild>>(
    `https://dev.azure.com/${metadata.organization}/${metadata.project}/_apis/build/builds?api-version=6.0`,
    { auth: { username: 'username', password: metadata.key } }
  );

  if (!res.data.value) {
    throw new Error(`Error getting Azure Devops Builds, status code: ${res.status}`);
  }

  return res.data.value.filter(predicate).map(map);
}

function predicate(build: IAzureBuild) {
  return build?.result === 'succeeded' || build?.result === 'failed';
}

function map(build: IAzureBuild): IPoint {
  return {
    measurement: 'build',
    tags: { 
      project: build.definition?.name,
      result: build.result
    },
    fields: { 
      duration: new Date(build.finishTime).getTime() - new Date(build.startTime).getTime(),
      success: build.result === 'succeeded' ? 1 : 0,
    },
    timestamp: new Date(build.startTime),
  };
}