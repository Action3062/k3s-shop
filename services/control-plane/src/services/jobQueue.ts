import { prisma } from '../db';
import { logger } from '../logger';
import { provisionInstance, deprovisionInstance } from './provisioner';
import { suspendInstance, resumeInstance, backupInstance } from './lifecycle';

export type JobKind = 'PROVISION' | 'SUSPEND' | 'RESUME' | 'DEPROVISION' | 'BACKUP';
const MAX_ATTEMPTS = 5;

async function execute(type: JobKind, instanceId: string): Promise<void> {
  switch (type) {
    case 'PROVISION':
      return provisionInstance(instanceId);
    case 'SUSPEND':
      return suspendInstance(instanceId);
    case 'RESUME':
      return resumeInstance(instanceId);
    case 'DEPROVISION':
      return deprovisionInstance(instanceId);
    case 'BACKUP':
      return backupInstance(instanceId);
  }
}

/**
 * Enqueue a job idempotently. `idemSuffix` makes a repeatable action (suspend/resume)
 * unique per trigger (e.g. the Stripe event id); omit it for once-only actions.
 */
export async function enqueueJob(
  instanceId: string,
  type: JobKind,
  idemSuffix?: string,
): Promise<void> {
  const idempotencyKey = `${type}:${instanceId}${idemSuffix ? `:${idemSuffix}` : ''}`;
  await prisma.provisioningJob.upsert({
    where: { idempotencyKey },
    update: {}, // already enqueued/processed -> no-op
    create: { instanceId, type, idempotencyKey },
  });
}

/** Claim and run a single queued job. Returns false when the queue is empty. */
export async function processOnce(): Promise<boolean> {
  const job = await prisma.provisioningJob.findFirst({
    where: { status: 'QUEUED' },
    orderBy: { createdAt: 'asc' },
  });
  if (!job) return false;

  await prisma.provisioningJob.update({
    where: { id: job.id },
    data: { status: 'RUNNING', attempts: { increment: 1 } },
  });

  try {
    await execute(job.type as JobKind, job.instanceId);
    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: { status: 'SUCCEEDED', lastError: null },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const exhausted = job.attempts + 1 >= MAX_ATTEMPTS;
    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: { status: exhausted ? 'FAILED' : 'QUEUED', lastError: message },
    });
    logger.error({ jobId: job.id, type: job.type, exhausted, err: message }, 'job failed');
  }
  return true;
}

/** Background worker loop. */
export function startWorker(intervalMs = 5000): void {
  let busy = false;
  setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      // drain the queue each tick
      // eslint-disable-next-line no-empty
      while (await processOnce()) {}
    } finally {
      busy = false;
    }
  }, intervalMs);
  logger.info({ intervalMs }, 'job worker started');
}
