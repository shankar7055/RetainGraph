import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.COGNEE_API_URL || 'http://0.0.0.0:8000';
  const token = process.env.COGNEE_API_KEY;
  
  const res = await fetch(`${url}/api/v1/search`, {
    method: 'POST',
    headers: { 'X-Api-Key': token!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      search_type: "GRAPH_COMPLETION",
      datasets: ["demo-tenant-123"],
      query: "test"
    })
  });
  
  const text = await res.text();
  console.log(text.substring(0, 1000));
}

run().catch(console.error);
