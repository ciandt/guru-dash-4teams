import { logger } from './shared/logger';
import { schedule } from 'node-cron';
import { syncMetrics } from './services/metrics.service';

const cron = process.env.CRON || '* * * * *';
logger.info(`Scheduling next execution with expression: ${cron}`);

async function main() {
  try {
    await syncMetrics();
  } catch (err) {
    logger.error(err, 'Error running process');
  }
}

main().then(() => schedule(cron, main));
