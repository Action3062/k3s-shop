import Stripe from 'stripe';
import { config } from './config';

export const stripe: Stripe | null = config.STRIPE_SECRET_KEY
  ? new Stripe(config.STRIPE_SECRET_KEY)
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY not configured');
  return stripe;
}
