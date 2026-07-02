import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BETA_TENANT_ID = 'beta-corp-456';

const betaInteractions = [
  {
    payload: "Beta Corp kickoff call. They are moving 10TB of data a month.",
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Support Ticket #301: API rate limits hitting hard during their midnight ETL runs.",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Email: 'Hey, our pipeline failed again last night because of the API drops. We need this fixed.'",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "QBR meeting notes: Customer is highly frustrated with API reliability. They requested a direct engineering SLA.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Support Ticket #350: Escalation regarding the SLA for API reliability.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

async function main() {
  console.log('Seeding database with Beta Corp interactions...');

  const tenant = await prisma.tenant.upsert({
    where: { id: BETA_TENANT_ID },
    update: {},
    create: {
      id: BETA_TENANT_ID,
      name: 'Beta Corp',
      billingTier: 'enterprise',
    },
  });

  for (const mockData of betaInteractions) {
    const existing = await prisma.clientInteraction.findFirst({
      where: {
        tenantId: BETA_TENANT_ID,
        payload: mockData.payload
      }
    });

    if (!existing) {
      await prisma.clientInteraction.create({
        data: {
          tenantId: BETA_TENANT_ID,
          payload: mockData.payload,
          createdAt: mockData.createdAt,
          processed: false // We want Cognee to process it
        }
      });
      console.log(`Inserted interaction: "${mockData.payload.substring(0, 30)}..."`);
    } else {
      await prisma.clientInteraction.update({
        where: { id: existing.id },
        data: { processed: false }
      });
      console.log(`Reset existing interaction to processed=false: "${mockData.payload.substring(0, 30)}..."`);
    }
  }

  console.log('Seed completed successfully. Triggering processing...');
  
  // Call the process endpoint to trigger cognee for beta corp
  const res = await fetch('http://localhost:3000/api/interactions/process', {
    method: 'POST',
    headers: {
      'x-api-key': 'demo-key-456', 'x-tenant-id': 'beta-corp-456'
    }
  });
  
  if (res.ok) {
    console.log('Processing triggered successfully.');
  } else {
    console.log('Failed to trigger processing.', res.status);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
