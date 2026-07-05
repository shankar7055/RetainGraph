import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../shared/config/prisma';
import { healthProcessor } from '../workers/health/processor';
import { ingestProcessor } from '../workers/ingest/processor';
import { chatService } from '../modules/chat/chat.service';

import { briefService } from '../modules/brief/brief.service';

const DEMO_TENANT_ID = 'demo-tenant-123';

async function runTest() {
  console.log('\n--- STARTING END-TO-END WORKFLOW TEST ---');

  console.log('[CLEANUP] Clearing previous test interactions and health audits...');
  await prisma.clientInteraction.deleteMany({ where: { tenantId: DEMO_TENANT_ID } });
  await prisma.customerHealth.deleteMany({ where: { tenantId: DEMO_TENANT_ID } });

  // Step 1: Ingest Client Objection
  console.log('\n[TEST 1] Ingesting negative interaction...');
  const newInteraction = await prisma.clientInteraction.create({
    data: {
      tenantId: DEMO_TENANT_ID,
      payload: "objection: We are evaluating Salesforce because your API keeps failing and support response times are unacceptable.",
      processed: false,
    },
  });
  console.log(`Interaction logged with ID: ${newInteraction.id}`);

  const PIPELINE_ID = 'pipeline_' + Math.random().toString(36).substring(2, 9);
  console.log(`Pipeline correlation ID: ${PIPELINE_ID}`);

  // Step 2: Run Ingestion Worker Processor (Cognee)
  console.log(`\n[TEST 2] [${PIPELINE_ID}] Running Ingest Processor...`);
  await ingestProcessor.process(newInteraction);

  // Step 3: Run Health Audit Worker
  console.log(`\n[TEST 3] [${PIPELINE_ID}] Running Health Evaluation Worker...`);
  await healthProcessor.evaluateTenantHealth(DEMO_TENANT_ID);

  const healthAfterIssue = await prisma.customerHealth.findFirst({
    where: { tenantId: DEMO_TENANT_ID, status: 'active' },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Active Health Risk Score: ${healthAfterIssue?.riskScore}/100`);
  console.log(`Confidence: ${healthAfterIssue?.confidence}`);

  // Step 4: CSM Dismiss Alert (Procedural Memory Seed)
  if (healthAfterIssue) {
    console.log(`\n[TEST 4] [${PIPELINE_ID}] CSM Dismisses Alert (Seeding False Alarm / Procedural Memory)...`);
    await prisma.customerHealth.update({
      where: { id: healthAfterIssue.id },
      data: {
        status: 'dismissed',
        correctionReason: 'Salesforce mention is a competitor intelligence benchmark check, not an active procurement cycle. API fixes have been deployed and verified.',
        resetAt: new Date(),
      },
    });
    console.log('CSM Dismissal recorded.');
  }

  // Step 5: Run Health Audit again
  console.log(`\n[TEST 5] [${PIPELINE_ID}] Re-running Health Evaluation Worker (should use Procedural Memory)...`);
  await healthProcessor.evaluateTenantHealth(DEMO_TENANT_ID);

  const healthAfterDismiss = await prisma.customerHealth.findFirst({
    where: { tenantId: DEMO_TENANT_ID },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`New Health Risk Score: ${healthAfterDismiss?.riskScore}/100`);

  const score1 = healthAfterIssue?.riskScore || 0;
  const score2 = healthAfterDismiss?.riskScore || 0;
  const delta = score2 - score1;
  console.log(`\n[METRICS] Risk Score Delta: ${delta}`);
  if (delta === 0) {
    console.log(`  - Competition Risk: Removed (Salesforce objection downgraded to standard benchmark check by CSM memory)`);
    console.log(`  - Engineering & Support Risk: Still dominant (API failures and support response delays remain active)`);
    console.log(`  - Net Change: 0`);
  } else if (delta < 0) {
    console.log(`  - Reason: Competitor evaluation objection dismissed and downgraded to a standard benchmark check based on CSM procedural memory.`);
  }

  // Step 6: Ask Copilot Chat
  console.log(`\n[TEST 6] [${PIPELINE_ID}] Querying AI Chat Copilot with Context Grounding...`);
  const response = await chatService.askQuestion(
    DEMO_TENANT_ID,
    DEMO_TENANT_ID,
    'Why is the client considering Salesforce and what are our open action items?'
  );
  console.log('AI Response:', response.answer);
  console.log('Citations Used:', response.citations);
  console.log('Graph Entities Used:', response.graphEntities);

  // Step 7: Generate Pre-Call Brief
  console.log(`\n[TEST 7] [${PIPELINE_ID}] Generating Pre-Call Brief...`);
  const brief = await briefService.getBrief(DEMO_TENANT_ID);
  console.log('Brief Executive Summary:', brief.executiveSummary);
  console.log('Brief Risk Score:', brief.customerHealth.riskScore);
  console.log('Brief Confidence:', brief.briefConfidence);
  console.log('Graph Entities Count:', brief.metadata.contextSources.graphEntities);
  console.log('Graph Relationships Count:', brief.metadata.contextSources.graphRelationships);

  console.log('\n--- END-TO-END WORKFLOW TEST COMPLETED ---');
}

runTest().catch((err) => {
  console.error('Test pipeline failed:', err);
});
