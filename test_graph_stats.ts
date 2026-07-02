import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Testing GET /api/tenants/demo-tenant-123/graph-stats...');
  const res = await fetch(`http://localhost:3000/api/tenants/demo-tenant-123/graph-stats`, {
    headers: { 'x-api-key': 'demo-key-456' }
  });
  
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
