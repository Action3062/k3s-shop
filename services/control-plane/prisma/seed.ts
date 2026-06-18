import { prisma } from '../src/db';

async function main() {
  const app = await prisma.catalogApp.upsert({
    where: { slug: 'vaultwarden' },
    update: {},
    create: {
      slug: 'vaultwarden',
      name: 'Vaultwarden',
      description: 'Self-hosted Passwortmanager (Bitwarden-kompatibel).',
      logoUrl: '/logos/vaultwarden.svg',
      category: 'Security',
      defaultStorageGi: 5,
    },
  });

  await prisma.plan.upsert({
    where: { stripePriceId: 'price_REPLACE_VAULTWARDEN_MONTHLY' },
    update: {},
    create: {
      appId: app.id,
      name: 'Standard',
      stripePriceId: 'price_REPLACE_VAULTWARDEN_MONTHLY',
      priceCents: 500,
      interval: 'month',
      cpuLimit: '500m',
      memLimitMi: 512,
      storageGi: 5,
    },
  });

  // eslint-disable-next-line no-console
  console.log('seeded: vaultwarden + Standard plan');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
