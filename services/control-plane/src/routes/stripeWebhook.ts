import { Request, Response } from 'express';
import type Stripe from 'stripe';
import { prisma } from '../db';
import { config } from '../config';
import { requireStripe } from '../stripe';
import { logger } from '../logger';
import { tenantNames } from '../lib/naming';
import { enqueueJob } from '../services/jobQueue';
import { scheduleDeprovision } from '../services/lifecycle';

/** Express handler — expects a raw Buffer body (express.raw). */
export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const stripe = requireStripe();
  const sig = req.header('stripe-signature') ?? '';
  if (!config.STRIPE_WEBHOOK_SECRET) {
    res.status(500).send('webhook secret not configured');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    logger.warn({ err: String(e) }, 'stripe signature verification failed');
    res.status(400).send('invalid signature');
    return;
  }

  // Idempotent dedupe
  const existing = await prisma.webhookEvent.findUnique({ where: { stripeEventId: event.id } });
  if (existing?.processedAt) {
    res.json({ received: true, deduped: true });
    return;
  }
  await prisma.webhookEvent.upsert({
    where: { stripeEventId: event.id },
    update: {},
    create: { stripeEventId: event.id, type: event.type, payload: event as unknown as object },
  });

  try {
    await handleEvent(event);
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processedAt: new Date() },
    });
    res.json({ received: true });
  } catch (e) {
    logger.error({ err: String(e), type: event.type }, 'webhook handling failed');
    res.status(500).json({ error: 'handling_failed' }); // Stripe retries
  }
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'invoice.payment_failed':
      await onPaymentFailed(event.data.object as Stripe.Invoice, event.id);
      break;
    case 'invoice.paid':
      await onInvoicePaid(event.data.object as Stripe.Invoice, event.id);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    default:
      logger.debug({ type: event.type }, 'unhandled stripe event');
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const md = session.metadata ?? {};
  const customerId = md.customerId;
  const planId = md.planId;
  const appSlug = md.appSlug;
  if (!customerId || !planId || !appSlug) {
    logger.error({ md }, 'checkout.session.completed missing metadata');
    return;
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, include: { user: true } });
  if (!customer) throw new Error(`customer ${customerId} not found`);

  // Persist Stripe customer id for the portal later.
  if (session.customer && !customer.stripeCustomerId) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { stripeCustomerId: String(session.customer) },
    });
  }

  const stripeSubId = session.subscription ? String(session.subscription) : null;

  // Idempotent: one subscription per Stripe subscription id.
  const existing = stripeSubId
    ? await prisma.subscription.findUnique({ where: { stripeSubscriptionId: stripeSubId } })
    : null;
  if (existing) {
    logger.info({ stripeSubId }, 'subscription already provisioned');
    return;
  }

  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId }, include: { app: true } });

  const username = customer.user?.username;
  if (!username) throw new Error(`customer ${customerId} has no username (set at registration)`);
  const naming = tenantNames({ username, appSlug, baseDomain: config.APPS_BASE_DOMAIN });

  const subscription = await prisma.subscription.create({
    data: {
      customerId,
      appId: plan.appId,
      planId: plan.id,
      stripeSubscriptionId: stripeSubId,
      status: 'ACTIVE',
      instance: {
        create: {
          appSlug,
          username: naming.username,
          name: plan.app.name,
          namespace: naming.namespace,
          subdomain: naming.subdomain,
          url: naming.url,
          status: 'PENDING',
          storageGi: plan.storageGi,
        },
      },
    },
    include: { instance: true },
  });

  if (subscription.instance) {
    await enqueueJob(subscription.instance.id, 'PROVISION');
    logger.info({ instanceId: subscription.instance.id, host: naming.host }, 'provision enqueued');
  }
}

async function onPaymentFailed(invoice: Stripe.Invoice, eventId: string): Promise<void> {
  const inst = await instanceForStripeSub(invoice.subscription);
  if (inst) await enqueueJob(inst.id, 'SUSPEND', eventId);
}

async function onInvoicePaid(invoice: Stripe.Invoice, eventId: string): Promise<void> {
  const inst = await instanceForStripeSub(invoice.subscription);
  if (inst && inst.status === 'SUSPENDED') await enqueueJob(inst.id, 'RESUME', eventId);
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const inst = await instanceForStripeSub(sub.id);
  if (!inst) return;
  await prisma.subscription.update({
    where: { id: inst.subscriptionId },
    data: { status: 'CANCELED' },
  });
  await scheduleDeprovision(inst.id); // backup + removal handled by the deprovision sweep
}

async function instanceForStripeSub(sub: string | Stripe.Subscription | null | undefined) {
  if (!sub) return null;
  const id = typeof sub === 'string' ? sub : sub.id;
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: id },
    include: { instance: true },
  });
  return subscription?.instance ?? null;
}

