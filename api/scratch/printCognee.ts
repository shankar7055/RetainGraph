import dotenv from 'dotenv';
dotenv.config();
import { cogneeGateway } from '../src/ai/gateways/CogneeGateway';

async function main() {
  console.log("Querying AWS Cognee Search...");
  const results = await cogneeGateway.search(
    "Retrieve overview, open issues, renew timeline, and stakeholders for brief.",
    ["demo-tenant-123"]
  );
  console.log("RAW RESULTS:");
  console.log(JSON.stringify(JSON.parse(results), null, 2).substring(0, 2000));
}

main().catch(console.error);
