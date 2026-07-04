import { PrismaClient } from '@prisma/client';
import { cogneeService } from '../src/services/CogneeService';
import { mockInteractions } from '../src/services/mockCogneeData';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  console.log("1. Creating acme-corp-789...");
  await prisma.tenant.upsert({
    where: { id: 'acme-corp-789' },
    update: {},
    create: { id: 'acme-corp-789', name: 'Acme Corp', billingTier: 'pro' }
  });

  console.log("2. Inserting interactions to DB and Cognee...");
  
  for (const interactionData of mockInteractions) {
    const record = await prisma.clientInteraction.create({
      data: { ...interactionData, tenantId: 'acme-corp-789', processed: true }
    });
    console.log(`Adding ${record.id} to Cognee for ${record.tenantId}`);
    await (cogneeService as any).addToCognee(record);
  }

  console.log("3. Running cognify for acme-corp-789...");
  await (cogneeService as any).cognifyDataset('acme-corp-789');
  
  console.log("Seed complete!");
}

seed().then(() => prisma.$disconnect()).catch(console.error);
