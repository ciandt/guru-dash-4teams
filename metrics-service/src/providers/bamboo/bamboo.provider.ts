import {IBambooMetadata} from "./bamboo.types";

import {getReleases} from "./metrics/bamboo.releases";
import {getPlans} from "./metrics/bamboo.builds";

export async function getBambooMetrics(metadata: IBambooMetadata) {
  const builds = await getPlans(metadata.projects, metadata);
  const releases = await getReleases(metadata);

  return [...builds,...releases];
}
