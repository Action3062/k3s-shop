import { Router } from 'express';
import { prisma } from '../db';
import { ApiError, errorBody } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { customerContext } from '../middleware/auth';
import { enqueueJob } from '../services/jobQueue';
import { scheduleDeprovision, suspendInstance, resumeInstance, restartInstance, reinstallInstance, regenerateGatewayToken } from '../services/lifecycle';
import { deprovisionInstance } from '../services/provisioner';
import { getDeploymentStatus, computeLiveStatus, getClusterSummary } from '../services/kubeStatus';
import { tagOf, appLatest } from '../services/versions';

export const servicesRouter = Router();

function instanceDto(i: {
  id: string; appSlug: string; name: string; status: string; url: string;
  subdomain: string; namespace: string; storageGi: number; createdAt: Date;
  suspendedAt: Date | null; deprovisionAfter: Date | null; lastBackupAt: Date | null;
}) {
  return {
    id: i.id, appSlug: i.appSlug, name: i.name, status: i.status, url: i.url,
    subdomain: i.subdomain, namespace: i.namespace, storageGi: i.storageGi,
    createdAt: i.createdAt, suspendedAt: i.suspendedAt,
    deprovisionAfter: i.deprovisionAfter, lastBackupAt: i.lastBackupAt,
  };
}

/** Load an instance and assert it belongs to the calling customer. */
async function ownedInstance(req: unknown, id: string) {
  const customerId = (req as { customerId?: string }).customerId!;
  const inst = await prisma.serviceInstance.findUnique({ where: { id }, include: { subscription: true } });
  if (!inst || inst.subscription.customerId !== customerId) {
    throw new ApiError(404, 'not_found', 'service not found');
  }
  return inst;
}

async function withLiveStatus<T extends { status: string; namespace: string; appSlug: string }>(i: T) {
  const st = await getDeploymentStatus(i.namespace, i.appSlug);
  const base = { ...instanceDto(i as never), status: computeLiveStatus(i.status, st) };
  const currentVersion = tagOf(st.image) ?? null;
  const latestVersion = (await appLatest(i.appSlug)) ?? null;
  const updateAvailable = !!(currentVersion && latestVersion && currentVersion !== latestVersion);
  return { ...base, currentVersion, latestVersion, updateAvailable };
}

// ---- customer-facing ----
servicesRouter.get('/me/services', customerContext, asyncHandler(async (req, res) => {
  const customerId = (req as { customerId?: string }).customerId!;
  const items = await prisma.serviceInstance.findMany({ where: { subscription: { customerId } }, orderBy: { createdAt: 'desc' } });
  res.json(await Promise.all(items.map(withLiveStatus)));
}));

servicesRouter.get('/services/:id', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  res.json(await withLiveStatus(inst));
}));

servicesRouter.post('/services/:id/start', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  await resumeInstance(inst.id);
  res.status(202).json({ ok: true, action: 'start' });
}));

servicesRouter.post('/services/:id/stop', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  await suspendInstance(inst.id);
  res.status(202).json({ ok: true, action: 'stop' });
}));

servicesRouter.post('/services/:id/restart', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  await restartInstance(inst.id);
  res.status(202).json({ ok: true, action: 'restart' });
}));

servicesRouter.post('/services/:id/reinstall', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  await reinstallInstance(inst.id);
  res.status(202).json({ ok: true, action: 'reinstall' });
}));

servicesRouter.get('/services/:id/token', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  res.json({ token: inst.gatewayToken ?? null });
}));

servicesRouter.post('/services/:id/regenerate-token', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  await regenerateGatewayToken(inst.id);
  res.status(202).json({ ok: true, action: 'regenerate-token' });
}));

servicesRouter.delete('/services/:id', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  const after = await scheduleDeprovision(inst.id);
  res.status(202).json({ scheduled: true, deprovisionAfter: after });
}));

// ---- admin (Router ist bereits hinter serviceAuth; KEIN customerContext) ----
servicesRouter.get('/admin/services', asyncHandler(async (_req, res) => {
  const items = await prisma.serviceInstance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { subscription: { include: { customer: { include: { user: true } } } } },
  });
  res.json(await Promise.all(items.map(async (i) => ({ ...(await withLiveStatus(i)), username: i.username, ownerEmail: i.subscription?.customer?.user?.email ?? null }))));
}));

// Loescht einen Server exakt wie das Abo-Ende: Subscription -> CANCELED, dann deprovisionInstance
// (entfernt das Git-Tenant-Verzeichnis -> Flux pruned Namespace, PVC und alle Workloads).
servicesRouter.delete('/admin/services/:id', asyncHandler(async (req, res) => {
  const inst = await prisma.serviceInstance.findUnique({ where: { id: req.params.id } });
  if (!inst) return res.status(404).json(errorBody('not_found', 'service not found'));
  await prisma.subscription.update({ where: { id: inst.subscriptionId }, data: { status: 'CANCELED' } }).catch(() => null);
  await deprovisionInstance(inst.id);
  res.status(202).json({ ok: true, action: 'deprovision' });
}));

// ---- internal / admin ----
servicesRouter.post('/services/:id/backup', asyncHandler(async (req, res) => {
  const inst = await prisma.serviceInstance.findUnique({ where: { id: req.params.id } });
  if (!inst) return res.status(404).json(errorBody('not_found', 'service not found'));
  await enqueueJob(req.params.id, 'BACKUP', `manual-${Date.now()}`);
  res.status(202).json({ enqueued: true });
}));

// ---- admin lifecycle (kundenuebergreifend; KEIN customerContext, nur serviceAuth) ----
const ADMIN_LIFECYCLE: Record<string, (id: string) => Promise<unknown>> = {
  start: resumeInstance,
  stop: suspendInstance,
  restart: restartInstance,
  reinstall: reinstallInstance,
  'regenerate-token': regenerateGatewayToken,
};

servicesRouter.post('/admin/services/:id/:action', asyncHandler(async (req, res) => {
  const { id, action } = req.params;
  const inst = await prisma.serviceInstance.findUnique({ where: { id } });
  if (!inst) return res.status(404).json(errorBody('not_found', 'service not found'));
  if (action === 'backup') {
    await enqueueJob(id, 'BACKUP', `admin-${Date.now()}`);
    return res.status(202).json({ enqueued: true, action });
  }
  const fn = ADMIN_LIFECYCLE[action];
  if (!fn) return res.status(400).json(errorBody('invalid_action', `unknown action: ${action}`));
  await fn(id);
  res.status(202).json({ ok: true, action });
}));

// Cluster-Gesundheit (Nodes / Pods / Namespaces) fuer den Admin-Bereich.
servicesRouter.get('/admin/cluster', asyncHandler(async (_req, res) => {
  res.json(await getClusterSummary());
}));
