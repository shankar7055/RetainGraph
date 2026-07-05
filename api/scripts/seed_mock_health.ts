import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.customerHealth.create({
    data: {
      tenantId: 'demo-tenant-123',
      riskScore: 78,
      confidence: 'high',
      rootCauses: JSON.stringify([
        {
          category: 'Support',
          contribution_percent: 60,
          evidence: 'Urgent unresolved outages reported during QBR.'
        },
        {
          category: 'Adoption',
          contribution_percent: 40,
          evidence: 'Decline in daily active ETL loads.'
        }
      ]),
      recommendedAction: 'Schedule emergency technical checkin with executive sponsor.'
    }
  });
  console.log("Mock CustomerHealth seeded successfully.");
}
run().then(() => prisma.$disconnect());
