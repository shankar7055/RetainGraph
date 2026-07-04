import { PrismaClient } from '@prisma/client';
import { cogneeService } from '../src/services/CogneeService';
import { mockInteractions } from '../src/services/mockCogneeData';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const betaInteractions = [
  {
    payload: "Onboarding call — positive, excited about integrations.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Support ticket — API rate limiting causing failures in their ETL pipeline.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Email — asking for ETA on the API stability fix.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Meeting — mentioned they're evaluating a competitor's API which 'just works'.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Support ticket — second API-related outage, they had to roll back an integration.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  },
  {
    payload: "Email — asked whether the platform has an SLA for uptime.",
    tenantId: "beta-corp-456",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

async function seed() {
  console.log("1. Ensuring tenants exist in DB...");
  await prisma.tenant.upsert({
    where: { id: 'demo-tenant-123' },
    update: {},
    create: { id: 'demo-tenant-123', name: 'Demo Company', billingTier: 'pro' }
  });
  
  await prisma.tenant.upsert({
    where: { id: 'beta-corp-456' },
    update: {},
    create: { id: 'beta-corp-456', name: 'Beta Corp', billingTier: 'pro' }
  });

  console.log("2. Clearing old interactions...");
  await prisma.clientInteraction.deleteMany({ where: { tenantId: { in: ['demo-tenant-123', 'beta-corp-456'] } } });

  console.log("3. Inserting new interactions to DB and Cognee...");
  const allInteractions = [...mockInteractions, ...betaInteractions];
  
  for (const interactionData of allInteractions) {
    const record = await prisma.clientInteraction.create({
      data: { ...interactionData, processed: true }
    });
    console.log(`Adding ${record.id} to Cognee for ${record.tenantId}`);
    await (cogneeService as any).addToCognee(record);
  }

  console.log("4. Running cognify for both tenants...");
  await (cogneeService as any).cognifyDataset('demo-tenant-123');
  await (cogneeService as any).cognifyDataset('beta-corp-456');
  
  console.log("Seed complete!");
}

seed().then(() => prisma.$disconnect()).catch(console.error);
