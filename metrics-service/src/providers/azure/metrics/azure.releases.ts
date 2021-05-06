import axios from "axios";
import { IPoint } from "influx";
import { IAzureMetadata, IAzureRelease, IAzureResponse } from "../azure.types";
import { logger } from '../../../shared/logger';

export async function getReleases(metadata: IAzureMetadata) {
  logger.info(`Getting Release Information from Azure Devops for ${metadata.organization} - ${metadata.project}`);

  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 3);
  const minStartedTime = minDate.toISOString();

  const metrics: IPoint[] = [];
  let continuationToken = 0;

  while (continuationToken >= 0) {
    continuationToken > 0 && logger.debug(`Getting next page continuationToken: ${continuationToken}`);
    
    const res = await axios.get<IAzureResponse<IAzureRelease>>(
      `https://vsrm.dev.azure.com/${metadata.organization}/${metadata.project}/_apis/release/deployments?api-version=6.1-preview.2&continuationToken=${continuationToken}&minStartedTime=${minStartedTime}`,
      { auth: { username: 'username', password: metadata.key } }
    );

    metrics.push(...res.data.value.filter(release => predicate(metadata, release)).map(map));
    continuationToken = Number(res.headers['x-ms-continuationtoken']);
  }

  return metrics;
}

// Filtra apenas releases de Produção
function predicate(metadata: IAzureMetadata, release: IAzureRelease): boolean {
  return metadata.releases.includes(release.releaseEnvironment.name);
}

function map(release: IAzureRelease): IPoint {
  return {
    measurement: 'deploy',
    tags: { 
      project: release.releaseDefinition.name,
    },
    fields: { 
      duration: new Date(release.completedOn).getTime() - new Date(release.startedOn).getTime(),
      success: release.deploymentStatus === 'succeeded' ? 1 : 0,
    },
    timestamp: new Date(release.startedOn),
  }
}