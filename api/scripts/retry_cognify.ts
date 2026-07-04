import { cogneeService } from '../src/services/CogneeService';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    console.log("Retrying cognify for demo-tenant-123...");
    await (cogneeService as any).cognifyDataset('demo-tenant-123');
  } catch (e) {
    console.error(e);
  }
  try {
    console.log("Retrying cognify for beta-corp-456...");
    await (cogneeService as any).cognifyDataset('beta-corp-456');
  } catch (e) {
    console.error(e);
  }
}

run();
