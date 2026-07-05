import { graphService } from '../modules/graph/graph.service';

async function main() {
  const data = await graphService.getGraphData("demo-tenant-123");
  console.log("--- GRAPH DATA SUMMARY ---");
  console.log("TOTAL NODES:", data.summary.totalNodes);
  console.log("TOTAL EDGES:", data.summary.totalEdges);
  console.log("NODES LIST:");
  console.dir(data.nodes, { depth: null });
}

main().catch(console.error);
