import { Router } from 'express';
import { prisma } from '../db';
import { ApiError, errorBody } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { customerContext } from '../middleware/auth';
import { enqueueJob } from '../services/jobQueue';
import { scheduleDeprovision, suspendInstance, resumeInstance, restartInstance, reinstallInstance, regenerateGatewayToken } from '../services/lifecycle';

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

// ---- customer-facing ----
servicesRouter.get('/me/services', customerContext, asyncHandler(async (req, res) => {
  const customerId = (req as { customerId?: string }).customerId!;
  const items = await prisma.serviceInstance.findMany({ where: { subscription: { customerId } }, orderBy: { createdAt: 'desc' } });
  res.json(items.map(instanceDto));
}));

servicesRouter.get('/services/:id', customerContext, asyncHandler(async (req, res) => {
  const inst = await ownedInstance(req, req.params.id);
  res.json(instanceDto(inst));
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

// ---- internal / admin ----
servicesRouter.post('/services/:id/backup', asyncHandler(async (req, res) => {
  const inst = await prisma.serviceInstance.findUnique({ where: { id: req.params.id } });
  if (!inst) return res.status(404).json(errorBody('not_found', 'service not found'));
  await enqueueJob(req.params.id, 'BACKUP', `manual-${Date.now()}`);
  res.status(202).json({ enqueued: true });
}));
