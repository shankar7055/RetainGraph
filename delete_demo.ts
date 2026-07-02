import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.tenant.delete({ where: { id: 'demo-tenant-123' } }).catch(() => {});
  console.log("Deleted demo-tenant-123");
}

run().then(() => prisma.$disconnect());
