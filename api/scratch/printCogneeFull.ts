import dotenv from 'dotenv';
dotenv.config();
import { cogneeGateway } from '../src/ai/gateways/CogneeGateway';

async function main() {
  const results = await cogneeGateway.search(
    "Retrieve overview, open issues, renew timeline, and stakeholders for brief.",
    ["demo-tenant-123"]
  );
  const parsed = JSON.parse(results);
  const firstResult = parsed[0]?.search_result || "";
  console.log("FULL SEARCH RESULT TEXT:");
  console.log(firstResult);
}

main().catch(console.error);
