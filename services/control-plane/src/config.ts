import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string(),
  CP_SERVICE_TOKEN: z.string().min(1),

  APPS_BASE_DOMAIN: z.string().default('dyndnsv4.de'),
  STOREFRONT_URL: z.string().default('https://store.dyndnsv4.de'),
  DEPROVISION_GRACE_DAYS: z.coerce.number().default(14),
  PROVISION_MODE: z.enum(['gitops', 'kubectl']).default('gitops'),

  // GitOps
  GITOPS_REPO_URL: z.string().optional(),
  GITOPS_REPO_BRANCH: z.string().default('main'),
  GITOPS_TENANTS_PATH: z.string().default('platform/tenants'),
  GITOPS_WORKDIR: z.string().default('/tmp/dynstore-gitops'),
  GIT_AUTHOR_NAME: z.string().default('dynstore-control-plane'),
  GIT_AUTHOR_EMAIL: z.string().default('[email protected]'),

  // Stripe (optional bis Phase 4 konfiguriert)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PORTAL_RETURN_URL: z.string().default('https://store.dyndnsv4.de/dashboard'),

  // Load Balancer (Ziel der Tenant-Records)
  LB_IPV4: z.string().default('91.98.1.85'),
  LB_IPV6: z.string().optional(),

  // dynDNSv4-Integration (DNS + ACME-DNS-01)
  DNS_MODE: z.enum(['wildcard-per-app', 'per-tenant', 'none']).default('wildcard-per-app'),
  DYNDNS_API_BASE: z.string().default('https://panel.dyndnsv4.de'),
  DYNDNS_USERNAME: z.string().optional(), // Account-E-Mail
  DYNDNS_TOKEN: z.string().optional(),    // Hostname-/Account-Token (NIE committen)

  KUBECONFIG: z.string().optional(),
});

export const config = schema.parse(process.env);
export type Config = z.infer<typeof schema>;
