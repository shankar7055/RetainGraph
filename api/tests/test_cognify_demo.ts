import { cogneeService } from '../src/services/cognee';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Retrying cognify for demo-tenant-123...");
  await (cogneeService as any).cognifyDataset('demo-tenant-123');
  console.log("Success!");
}

run().catch(console.error);
