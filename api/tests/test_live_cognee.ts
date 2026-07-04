import { PrismaClient } from '@prisma/client';
import { cogneeService } from '../src/services/CogneeService';

const prisma = new PrismaClient();

async function run() {
  console.log("Resetting processed=false for demo-tenant-123...");
  await prisma.clientInteraction.updateMany({
    where: { tenantId: 'demo-tenant-123' },
    data: { processed: false }
  });

  console.log("Processing pending interactions against live Cognee...");
  await cogneeService.processPendingInteractions();

  console.log("Searching context from live Cognee...");
  try {
    const res = await cogneeService.searchContext("Retrieve recent issues, sentiment, and risks for the account.", "demo-tenant-123");
    console.log("Search result length:", res.length);
    console.log(res.substring(0, 500));
  } catch (err) {
    console.error("Search failed:", err);
  }
}
run().then(() => prisma.$disconnect());
