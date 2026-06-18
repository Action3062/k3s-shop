import { Router } from 'express';
import { prisma } from '../db';
import { ApiError, errorBody } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { customerContext } from '../middleware/auth';
import { enqueueJob } from '../services/jobQueue';
import { scheduleDeprovision } from '../services/lifecycle';

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

// ---- customer-facing ----
servicesRouter.get(
  '/me/services',
  customerContext,
  asyncHandler(async (req, res) => {
    const customerId = (req as { customerId?: string }).customerId!;
    const items = await prisma.serviceInstance.findMany({
      where: { subscription: { customerId } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(instanceDto));
  }),
);

servicesRouter.get(
  '/services/:id',
  customerContext,
  asyncHandler(async (req, res) => {
    const customerId = (req as { customerId?: string }).customerId!;
    const inst = await prisma.serviceInstance.findUnique({
      where: { id: req.params.id },
      include: { subscription: true },
    });
    if (!inst || inst.subscription.customerId !== customerId) {
      return res.status(404).json(errorBody('not_found', 'service not found'));
    }
    res.json(instanceDto(inst));
  }),
);

servicesRouter.delete(
  '/services/:id',
  customerContext,
  asyncHandler(async (req, res) => {
    const customerId = (req as { customerId?: string }).customerId!;
    const inst = await prisma.serviceInstance.findUnique({
      where: { id: req.params.id },
      include: { subscription: true },
    });
    if (!inst || inst.subscription.customerId !== customerId) {
      return res.status(404).json(errorBody('not_found', 'service not found'));
    }
    const after = await scheduleDeprovision(inst.id);
    res.status(202).json({ scheduled: true, deprovisionAfter: after });
  }),
);

// ---- internal / admin ----
servicesRouter.post(
  '/services/:id/suspend',
  asyncHandler(async (req, res) => {
    await assertInstance(req.params.id);
    await enqueueJob(req.params.id, 'SUSPEND', `manual-${Date.now()}`);
    res.status(202).json({ enqueued: true });
  }),
);

servicesRouter.post(
  '/services/:id/resume',
  asyncHandler(async (req, res) => {
    await assertInstance(req.params.id);
    await enqueueJob(req.params.id, 'RESUME', `manual-${Date.now()}`);
    res.status(202).json({ enqueued: true });
  }),
);

servicesRouter.post(
  '/services/:id/backup',
  asyncHandler(async (req, res) => {
    await assertInstance(req.params.id);
    await enqueueJob(req.params.id, 'BACKUP', `manual-${Date.now()}`);
    res.status(202).json({ enqueued: true });
  }),
);

async function assertInstance(id: string) {
  const inst = await prisma.serviceInstance.findUnique({ where: { id } });
  if (!inst) throw new ApiError(404, 'not_found', 'service not found');
}
