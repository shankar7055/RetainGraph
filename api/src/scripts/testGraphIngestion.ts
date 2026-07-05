import { graphService } from '../modules/graph/graph.service';
import { prisma } from '../lib/prisma';
import { ingestProcessor } from '../workers/ingest/processor';

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("--- PHASE 1: Fetching initial graph state ---");
  let dataBefore = await graphService.getGraphData("demo-tenant-123");
  const initialCount = dataBefore.summary.totalNodes;
  console.log(`Initial Node Count: ${initialCount}`);

  console.log("\n--- PHASE 2: Ingesting a completely new test scenario ---");
  const testInteraction = await prisma.clientInteraction.create({
    data: {
      tenantId: "demo-tenant-123",
      payload: "objection: CTO Captain Hook from HookEnterprise says that they are migrating to competitor SuperScaleGraph because of compliance issues.",
      processed: false,
    }
  });
  console.log(`Created pending interaction in DB: ${testInteraction.id}`);

  console.log("Processing interaction & uploading to Cognee...");
  await ingestProcessor.process(testInteraction);
  console.log("Interaction processed successfully!");

  console.log("\n--- PHASE 3: Waiting for Cognee Cloud graph construction (60 seconds) ---");
  console.log("Please wait, Cognee is building the semantic relationships asynchronously...");
  await wait(60000);

  console.log("\n--- PHASE 4: Fetching updated graph state ---");
  let dataAfter = await graphService.getGraphData("demo-tenant-123");
  const finalCount = dataAfter.summary.totalNodes;
  console.log(`Final Node Count: ${finalCount}`);
  console.log(`Node Difference: ${finalCount - initialCount}`);

  console.log("\nUpdated Nodes List:");
  console.dir(dataAfter.nodes.map(n => ({ label: n.label, type: n.type })), { depth: null });
}

main().catch(console.error);
