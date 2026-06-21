import { prisma } from '../db';
import { config } from '../config';
import { renderTenantTemplate } from './templates';
import { renderHelmRelease } from './helmrelease';
import { writeFilesAndCommit, removePathAndCommit } from './gitops';
import { ensureTenantRecord } from './dns';
import { generateGatewayToken, renderGatewaySecret } from './tokens';
import { encryptSecretYaml } from './sops';
import { logger } from '../logger';

function tenantDir(namespace: string): string {
  return `${config.GITOPS_TENANTS_PATH}/${namespace}`;
}

function chartValues(inst: { username: string; appSlug: string; storageGi: number; dataVersion: number }, replicas: number) {
  return {
    username: inst.username,
    appName: inst.appSlug,
    baseDomain: config.APPS_BASE_DOMAIN,
    replicas,
    storage: { size: `${inst.storageGi}Gi` },
    dataVersion: inst.dataVersion,
  };
}

/** Render tenant-template + HelmRelease, ensure DNS, and commit to the gitops repo. */
export async function provisionInstance(instanceId: string): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({
    where: { id: instanceId },
    include: { subscription: { include: { plan: true } } },
  });
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'PROVISIONING' } });

  // 1) DNS (no-op im wildcard-per-app-Modus)
  await ensureTenantRecord(`${inst.subdomain}.${config.APPS_BASE_DOMAIN}`);

  // 2) Tenant-Template + HelmRelease rendern
  const plan = inst.subscription.plan;
  const dir = tenantDir(inst.namespace);
  const template = await renderTenantTemplate({
    namespace: inst.namespace,
    tenant: inst.username,
    app: inst.appSlug,
    cpuRequest: plan.cpuLimit ?? '1',
    memRequest: plan.memLimitMi ? `${plan.memLimitMi}Mi` : '1Gi',
    // OpenClaw betreibt zusaetzlich einen Web-CLI-Sidecar (eigenes Deployment) -> Quota-Puffer
    cpuLimit:
      inst.appSlug === 'openclaw'
        ? `${(plan.cpuLimit && plan.cpuLimit.endsWith('m') ? parseInt(plan.cpuLimit) : Math.round(parseFloat(plan.cpuLimit ?? '1') * 1000)) + 500}m`
        : plan.cpuLimit ?? '1',
    memLimit:
      inst.appSlug === 'openclaw'
        ? `${(plan.memLimitMi ?? 1024) + 1024}Mi`
        : plan.memLimitMi ? `${plan.memLimitMi}Mi` : '1Gi',
    storage: `${inst.storageGi}Gi`,
  });
  const helmRelease = renderHelmRelease({
    name: `${inst.username}-${inst.appSlug}`,
    namespace: inst.namespace,
    appChart: inst.appSlug,
    values: chartValues(inst, 1),
  });

  const files: Record<string, string> = {};
  for (const [name, content] of Object.entries(template)) files[`${dir}/${name}`] = content;
  files[`${dir}/helmrelease.yaml`] = helmRelease;

  // OpenClaw: Gateway-Token erzeugen, in DB speichern, als SOPS-Secret mitcommitten (nie im Klartext in Git)
  if (inst.appSlug === 'openclaw') {
    const token = generateGatewayToken();
    await prisma.serviceInstance.update({ where: { id: instanceId }, data: { gatewayToken: token } });
    files[`${dir}/secret.sops.yaml`] = await encryptSecretYaml(renderGatewaySecret(inst.namespace, inst.username, token));
  }

  // 3) Commit -> Flux reconciled
  await writeFilesAndCommit(files, `provision: ${inst.namespace}`);

  // NOTE: Flux-Reconcile ist asynchron. Ein Readiness-Reconciler (kube.isDeploymentReady)
  // sollte PROVISIONING -> RUNNING setzen. MVP: optimistisch RUNNING nach erfolgreichem Push.
  await prisma.serviceInstance.update({
    where: { id: instanceId },
    data: { status: 'RUNNING', helmReleasePath: `${dir}/helmrelease.yaml` },
  });
  logger.info({ instanceId, namespace: inst.namespace }, 'instance provisioned');
}

/** Remove the tenant directory (Flux prune deletes namespace + workloads). */
export async function deprovisionInstance(instanceId: string): Promise<void> {
  const inst = await prisma.serviceInstance.findUniqueOrThrow({ where: { id: instanceId } });
  // Idempotent: bereits entfernt -> nichts tun (verhindert doppelte Laeufe via Sweep/Job/Webhook)
  if (inst.status === 'DEPROVISIONED') {
    logger.info({ instanceId }, 'deprovision skipped (already deprovisioned)');
    return;
  }
  await prisma.serviceInstance.update({ where: { id: instanceId }, data: { status: 'DEPROVISIONING' } });
  await removePathAndCommit(tenantDir(inst.namespace), `deprovision: ${inst.namespace}`);
  // Tombstone: @unique-Felder freigeben, damit derselbe Kunde dieselbe App erneut bestellen kann.
  // Ohne das blockiert der alte Datensatz namespace/subdomain -> Neu-Provisionierung scheitert an P2002.
  const freed = `removed-${Date.now().toString(36)}-${instanceId.slice(-6)}`;
  await prisma.serviceInstance.update({
    where: { id: instanceId },
    data: {
      status: 'DEPROVISIONED',
      namespace: `${inst.namespace}-${freed}`.slice(0, 63),
      subdomain: `${inst.subdomain}-${freed}`,
    },
  });
  logger.info({ instanceId, namespace: inst.namespace }, 'instance deprovisioned (unique freed)');
}

export { chartValues };
