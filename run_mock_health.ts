import { PrismaClient } from '@prisma/client';
import { evaluateTenantHealth } from './src/workers/healthWorker';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runTest() {
  console.log("Forcing health check evaluation in MOCK MODE...");
  await evaluateTenantHealth('demo-tenant-123');
  
  const healths = await prisma.customerHealth.findMany({ 
    where: { tenantId: 'demo-tenant-123' },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log("\nRecent health records for demo-tenant-123:");
  healths.forEach(h => {
    console.log(`- ID: ${h.id}, Status: ${h.status}, Score: ${h.riskScore}, Correction: ${h.correctionReason}`);
    console.log(`  Action: ${h.recommendedAction}`);
  });
}

runTest().then(() => prisma.$disconnect()).catch(console.error);
