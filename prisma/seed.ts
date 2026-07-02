import { PrismaClient } from '@prisma/client';
import { mockInteractions } from '../src/services/mockCogneeData';

const prisma = new PrismaClient();
const DEMO_TENANT_ID = 'demo-tenant-123';

async function main() {
  console.log('Seeding database with mock interactions...');

  // Ensure demo tenant exists
  const tenant = await prisma.tenant.upsert({
    where: { id: DEMO_TENANT_ID },
    update: {},
    create: {
      id: DEMO_TENANT_ID,
      name: 'Demo Company',
      billingTier: 'pro',
    },
  });

  console.log(`Ensured tenant ${tenant.id} exists.`);

  // Insert mock interactions (ensuring no duplicate payload for clean seeding)
  for (const mockData of mockInteractions) {
    const existing = await prisma.clientInteraction.findFirst({
      where: {
        tenantId: DEMO_TENANT_ID,
        payload: mockData.payload
      }
    });

    if (!existing) {
      await prisma.clientInteraction.create({
        data: {
          tenantId: DEMO_TENANT_ID,
          payload: mockData.payload,
          createdAt: mockData.createdAt,
          processed: true // Mocked so we don't trigger Cognee loop again
        }
      });
      console.log(`Inserted interaction: "${mockData.payload.substring(0, 30)}..."`);
    } else {
      console.log(`Skipped existing interaction: "${mockData.payload.substring(0, 30)}..."`);
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
