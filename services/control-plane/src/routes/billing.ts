import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { config } from '../config';
import { requireStripe } from '../stripe';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { customerAssertion } from '../middleware/auth';

export const billingRouter = Router();

const checkoutBody = z.object({ planId: z.string().min(1) });

billingRouter.post(
  '/checkout/session',
  customerAssertion,
  asyncHandler(async (req, res) => {
    const customerId = (req as { customerId?: string }).customerId!;
    const { planId } = checkoutBody.parse(req.body);
    const plan = await prisma.plan.findUnique({ where: { id: planId }, include: { app: true } });
    if (!plan) throw new ApiError(404, 'not_found', 'plan not found');
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new ApiError(404, 'not_found', 'customer not found');

    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${config.STOREFRONT_URL}/dashboard?provisioning=1`,
      cancel_url: `${config.STOREFRONT_URL}/catalog/${plan.app.slug}`,
      client_reference_id: customerId,
      customer: customer.stripeCustomerId ?? undefined,
      metadata: { customerId, planId: plan.id, appId: plan.appId, appSlug: plan.app.slug },
      subscription_data: { metadata: { customerId, planId: plan.id, appSlug: plan.app.slug } },
    });
    res.json({ checkoutUrl: session.url });
  }),
);

billingRouter.post(
  '/portal/session',
  customerAssertion,
  asyncHandler(async (req, res) => {
    const customerId = (req as { customerId?: string }).customerId!;
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer?.stripeCustomerId) throw new ApiError(404, 'not_found', 'no stripe customer');
    const stripe = requireStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: config.STRIPE_PORTAL_RETURN_URL,
    });
    res.json({ portalUrl: session.url });
  }),
);
