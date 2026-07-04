import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.COGNEE_API_URL || 'http://0.0.0.0:8000';
  const token = process.env.COGNEE_API_KEY;
  
  const res = await fetch(`${url}/api/v1/datasets`, {
    headers: { 'X-Api-Key': token! }
  });
  
  const text = await res.text();
  console.log(text);
}

run().catch(console.error);
