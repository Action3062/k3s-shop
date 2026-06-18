import { prisma } from '../db';
import { config } from '../config';
import { renderHelmRelease } from './helmrelease';
import { writeFilesAndCommit } from './gitops';
import { createVolumeSnapshot } from './kube';
import { generateGatewayToken, renderGatewaySecret } from './tokens';
import { encryptSecretYaml } from './sops';
import { logger } from '../logger';

function tenantDir(namespace: string): string {
  return `${config.GITOPS_TENANTS_PATH}/${namespace}`;
}

interface RewriteOpts { replicas: number; restartToken?: string; message: string; }

async function rewriteHelmRelease(instanceId: string, opts: RewriteOpts): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  const hr = renderHelmRelease({
    name: `${inst.username}-${inst.appSlug}`,
    namespace: inst.namespace,
    appChart: inst.appSlug,
    values: {
      username: inst.username,
      appName: inst.appSlug,
      baseDomain: config.APPS_BASE_DOMAIN,
      replicas: opts.replicas,
      storage: { size: `${inst.storageGi}Gi` },
      dataVersion: inst.dataVersion,
      restartToken: opts.restartToken ?? '',
    },
  });
  await writeFilesAndCommit(
    { [`${tenantDir(inst.namespace)}/helmrelease.yaml`]: hr },
    `${opts.message}: ${inst.namespace}`,
  );
}

export async function suspendInstance(instanceId: string): Promise<void> {
  await rewriteHelmRelease(instanceId, { replicas: 0, message: 'suspend' });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'SUSPENDED', suspendedAt: new Date() } });
  logger.info({ instanceId }, 'instance suspended');
}

export async function resumeInstance(instanceId: string): Promise<void> {
  await rewriteHelmRelease(instanceId, { replicas: 1, message: 'resume' });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'RUNNING', suspendedAt: null } });
  logger.info({ instanceId }, 'instance resumed');
}

/** Restart: forciert via geänderten restart-token einen Pod-Neustart (Daten bleiben). */
export async function restartInstance(instanceId: string): Promise<void> {
  await rewriteHelmRelease(instanceId, { replicas: 1, restartToken: String(Date.now()), message: 'restart' });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'RUNNING', suspendedAt: null } });
  logger.info({ instanceId }, 'instance restarted');
}

/** Neuinstallation: dataVersion++ -> Helm löscht altes Volume + legt ein frisches an (DATEN WEG). */
export async function reinstallInstance(instanceId: string): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { dataVersion: inst.dataVersion + 1, status: 'PROVISIONING' } });
  await rewriteHelmRelease(instanceId, { replicas: 1, restartToken: String(Date.now()), message: 'reinstall' });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'RUNNING', suspendedAt: null } });
  logger.warn({ instanceId, dataVersion: inst.dataVersion + 1 }, 'instance reinstalled (data wiped)');
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
    const pvc = `${inst.appSlug}-data-v${inst.dataVersion}`;
    const snapName = `${inst.username}-${inst.appSlug}-${backup.id}`.slice(0, 63);
    await createVolumeSnapshot(inst.namespace, pvc, snapName);
    await prisma.backup.update({ where: { id: backup.id }, data: { status: 'COMPLETED', snapshotRef: snapName } });
    await prisma.serviceInstance.update({ where: { id: instanceId }, data: { lastBackupAt: new Date() } });
    logger.info({ instanceId, snapName }, 'backup created');
  } catch (e) {
    await prisma.backup.update({ where: { id: backup.id }, data: { status: 'FAILED', location: String((e as Error).message) } });
    throw e;
  }
}

export async function regenerateGatewayToken(instanceId: string): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  const token = generateGatewayToken();
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { gatewayToken: token } });
  const dir = tenantDir(inst.namespace);
  const secret = await encryptSecretYaml(renderGatewaySecret(inst.namespace, token));
  const hr = renderHelmRelease({
    name: `${inst.username}-${inst.appSlug}`,
    namespace: inst.namespace,
    appChart: inst.appSlug,
    values: {
      username: inst.username, appName: inst.appSlug, baseDomain: config.APPS_BASE_DOMAIN,
      replicas: 1, storage: { size: `${inst.storageGi}Gi` }, dataVersion: inst.dataVersion,
      restartToken: String(Date.now()),
    },
  });
  await writeFilesAndCommit({ [`${dir}/secret.sops.yaml`]: secret, [`${dir}/helmrelease.yaml`]: hr }, `regenerate-token: ${inst.namespace}`);
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'RUNNING' } });
  logger.info({ instanceId }, 'gateway token regenerated');
}
