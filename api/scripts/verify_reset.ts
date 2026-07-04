import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const TENANT_ID = 'demo-tenant-123';

async function verify() {
  console.log('1. Triggering Reset via API...');
  const res = await fetch(`http://localhost:3000/api/tenants/${TENANT_ID}/forget`, {
    method: 'POST',
    headers: { 'x-api-key': 'demo-key-456' }
  });
  if (!res.ok) {
    throw new Error('Forget API failed: ' + await res.text());
  }
  const result = await res.json();
  console.log('Forget API Response:', result);

  console.log('\n2. Checking Database...');
  const healths = await prisma.customerHealth.findMany({ where: { tenantId: TENANT_ID } });
  console.log('CustomerHealth statuses: ', healths.map(h => h.status));

  const interactions = await prisma.clientInteraction.findMany({ where: { tenantId: TENANT_ID } });
  console.log('Processed=false count: ', interactions.filter(i => i.processed === false).length, 'out of', interactions.length);

  console.log('\n3. Inserting new interaction for re-evaluation...');
  await prisma.clientInteraction.create({
    data: {
      tenantId: TENANT_ID,
      payload: "Customer says everything is great, looking to renew.",
      processed: false
    }
  });
  console.log('Inserted new interaction.');
}

verify().then(() => prisma.$disconnect()).catch(e => console.error(e));
