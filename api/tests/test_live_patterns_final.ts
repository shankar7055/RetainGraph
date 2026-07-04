import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Testing LIVE Mode Pattern Detection (Final)...');
  const res = await fetch(`http://localhost:3000/api/patterns?query=Which%20accounts%20are%20reporting%20API%20reliability%20issues`, {
    headers: { 'x-api-key': 'demo-key-456' }
  });
  
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
