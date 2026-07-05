import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/prisma';
import { healthProcessor } from './health/processor';

async function runOneshotScan() {
  console.log('[ChurnScan] Starting oneshot churn risk sweep...');
  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });
    console.log(`[ChurnScan] Evaluating ${tenants.length} tenants...`);

    for (const tenant of tenants) {
      console.log(`[ChurnScan] Starting evaluation for tenant: ${tenant.name} (${tenant.id})`);
      await healthProcessor.evaluateTenantHealth(tenant.id);
    }

    console.log('[ChurnScan] Oneshot sweep completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[ChurnScan] Fatal error during sweep:', error);
    process.exit(1);
  }
}

runOneshotScan();
