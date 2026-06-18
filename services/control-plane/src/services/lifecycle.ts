import { prisma } from '../db';
import { config } from '../config';
import { renderHelmRelease } from './helmrelease';
import { writeFilesAndCommit } from './gitops';
import { createVolumeSnapshot } from './kube';
import { logger } from '../logger';

function tenantDir(namespace: string): string {
  return `${config.GITOPS_TENANTS_PATH}/${namespace}`;
}

async function rewriteHelmRelease(instanceId: string, replicas: number): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  const hr = renderHelmRelease({
    name: `${inst.username}-${inst.appSlug}`,
    namespace: inst.namespace,
    appChart: inst.appSlug,
    values: {
      username: inst.username,
      appName: inst.appSlug,
      baseDomain: config.APPS_BASE_DOMAIN,
      replicas,
      storage: { size: `${inst.storageGi}Gi` },
    },
  });
  await writeFilesAndCommit(
    { [`${tenantDir(inst.namespace)}/helmrelease.yaml`]: hr },
    `${replicas === 0 ? 'suspend' : 'resume'}: ${inst.namespace}`,
  );
}

export async function suspendInstance(instanceId: string): Promise<void> {
  await rewriteHelmRelease(instanceId, 0);
  await prisma.serviceInstance.update({
    where: { id: instanceId },
    data: { status: 'SUSPENDED', suspendedAt: new Date() },
  });
  logger.info({ instanceId }, 'instance suspended');
}

export async function resumeInstance(instanceId: string): Promise<void> {
  await rewriteHelmRelease(instanceId, 1);
  await prisma.serviceInstance.update({
    where: { id: instanceId },
    data: { status: 'RUNNING', suspendedAt: null },
  });
  logger.info({ instanceId }, 'instance resumed');
}

export async function scheduleDeprovision(instanceId: string): Promise<Date> {
  const after = new Date(Date.now() + config.DEPROVISION_GRACE_DAYS * 24 * 60 * 60 * 1000);
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { deprovisionAfter: after } });
  logger.info({ instanceId, after }, 'deprovision scheduled');
  return after;
}

export async function backupInstance(instanceId: string): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  const backup = await prisma.backup.create({ data: { instanceId, status: 'PENDING' } });
  try {
    const pvc = `${inst.appSlug}-data`;
    const snapName = `${inst.username}-${inst.appSlug}-${backup.id}`.slice(0, 63);
    await createVolumeSnapshot(inst.namespace, pvc, snapName);
    await prisma.backup.update({ where: { id: backup.id }, data: { status: 'COMPLETED', snapshotRef: snapName } });
    await prisma.serviceInstance.update({ where: { id: instanceId }, data: { lastBackupAt: new Date() } });
    logger.info({ instanceId, snapName }, 'backup created');
  } catch (e) {
    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: 'FAILED', location: String((e as Error).message) },
    });
    throw e;
  }
}
