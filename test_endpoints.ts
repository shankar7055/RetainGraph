import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Testing GET /api/tenants/demo-tenant-123/health-history...');
  const res1 = await fetch(`http://localhost:3000/api/tenants/demo-tenant-123/health-history`, {
    headers: { 'x-api-key': 'demo-key-456' }
  });
  const data1 = await res1.json();
  console.log("Health History length:", data1.length);
  if (data1.length > 0) console.log("Sample:", data1[0]);

  console.log('\nTesting POST /api/tenants/demo-tenant-123/generate-email...');
  const res2 = await fetch(`http://localhost:3000/api/tenants/demo-tenant-123/generate-email`, {
    method: 'POST',
    headers: { 'x-api-key': 'demo-key-456' }
  });
  const data2 = await res2.json();
  console.log("Email Draft:", data2);
}

run().catch(console.error);
