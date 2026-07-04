import { PrismaClient } from '@prisma/client';
import { cogneeService } from '../src/services/CogneeService';
import { mockInteractions } from '../src/services/mockCogneeData';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const acmeInteractions = [...mockInteractions].map(i => ({...i}));
// Modify one interaction to explicitly mention API so it matches the pattern detection query
acmeInteractions[4]!.payload = "QBR Meeting Transcript: Acme's champion mentions the team is 'frustrated with API reliability' and asks for a firm roadmap update on the delayed reporting feature.";

async function seed() {
  await prisma.tenant.delete({ where: { id: 'acme-corp-789' } }).catch(() => {});
  
  await prisma.tenant.upsert({
    where: { id: 'demo-tenant-123' },
    update: {},
    create: { id: 'demo-tenant-123', name: 'Demo Company', billingTier: 'pro' }
  });

  await prisma.clientInteraction.deleteMany({ where: { tenantId: 'demo-tenant-123' } });

  for (const interactionData of acmeInteractions) {
    const record = await prisma.clientInteraction.create({
      data: { ...interactionData, tenantId: 'demo-tenant-123', processed: true }
    });
    console.log(`Adding ${record.id} to Cognee for demo-tenant-123`);
    await (cogneeService as any).addToCognee(record);
  }

  console.log("Running cognify for demo-tenant-123...");
  await (cogneeService as any).cognifyDataset('demo-tenant-123');
  
  console.log("Seed complete!");
}

seed().then(() => prisma.$disconnect()).catch(console.error);
