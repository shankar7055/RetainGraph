import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.COGNEE_API_URL || 'http://0.0.0.0:8000';
  const token = process.env.COGNEE_API_KEY;
  const uuid = "5e17a91b-9c2e-53fa-b8ee-fa172bba596a";
  
  const res = await fetch(`${url}/api/v1/schema/inventory?dataset_id=${uuid}`, {
    headers: { 'X-Api-Key': token! }
  });
  
  const text = await res.text();
  console.log(text.substring(0, 1000));
}

run().catch(console.error);
