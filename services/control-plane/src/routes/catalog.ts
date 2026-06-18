import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler } from '../lib/asyncHandler';
import { errorBody } from '../lib/errors';

export const catalogRouter = Router();

type AppWithPlans = Awaited<ReturnType<typeof fetchApp>>;
function fetchApp(slug: string) {
  return prisma.catalogApp.findUnique({ where: { slug }, include: { plans: true } });
}

function toDto(a: NonNullable<AppWithPlans>) {
  return {
    slug: a.slug,
    name: a.name,
    description: a.description,
    logoUrl: a.logoUrl,
    category: a.category,
    plans: a.plans.map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
      interval: p.interval,
      storageGi: p.storageGi,
    })),
  };
}

catalogRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const apps = await prisma.catalogApp.findMany({
      where: { active: true },
      include: { plans: true },
      orderBy: { name: 'asc' },
    });
    res.json(apps.map(toDto));
  }),
);

catalogRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const app = await fetchApp(req.params.slug);
    if (!app) return res.status(404).json(errorBody('not_found', 'app not found'));
    res.json(toDto(app));
  }),
);
