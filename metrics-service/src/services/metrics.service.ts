import { logger } from '../shared/logger';
import {providerFactory} from "../providers/provider.factory";
import {getDatasources} from "../providers/metrics-config/metrics-config.provider";

export async function syncMetrics() {
  const datasources = await getDatasources();

  for (const datasource of datasources) {
    try {
      await providerFactory(datasource);
    } catch (err) {
      logger.error(err, `Error processing ${datasource.name}`);
    }
  }
}
