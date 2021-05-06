import {IAzureMetadata} from "./azure.types";

import {getBugs} from "./metrics/azure.bugs";
import {getReleases} from "./metrics/azure.releases";
import {getBuilds} from "./metrics/azure.builds";

export async function getAzureMetrics(metadata: IAzureMetadata) {
  const builds = await getBuilds(metadata);
  const releases = await getReleases(metadata);
  const bugs = await getBugs(metadata);

  return [...builds, ...releases, ...bugs];
}
