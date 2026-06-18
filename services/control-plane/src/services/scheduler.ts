import { prisma } from '../db';
import { logger } from '../logger';
import { enqueueJob } from './jobQueue';

/**
 * Periodically finds instances whose grace period elapsed and enqueues a backup
 * followed by deprovision. Idempotent via the job idempotency keys.
 */
export function startDeprovisionSweep(intervalMs = 60_000): void {
  setInterval(async () => {
    try {
      const due = await prisma.serviceInstance.findMany({
        where: {
          deprovisionAfter: { lte: new Date() },
          status: { in: ['RUNNING', 'SUSPENDED'] },
        },
      });
      for (const inst of due) {
        await enqueueJob(inst.id, 'BACKUP', 'predeprovision');
        await enqueueJob(inst.id, 'DEPROVISION');
        logger.info({ instanceId: inst.id }, 'deprovision sweep: enqueued backup + deprovision');
      }
    } catch (e) {
      logger.error({ err: String(e) }, 'deprovision sweep failed');
    }
  }, intervalMs);
  logger.info({ intervalMs }, 'deprovision sweep started');
}
