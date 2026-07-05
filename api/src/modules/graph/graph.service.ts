import { memoryService } from '../../ai/services/MemoryService';

export class GraphService {
  public async getGraphData(tenantId: string) {
    try {
      const graphContext = await memoryService.getGraphContext(
        "Retrieve all entities, customers, companies, competitors, support tickets, warnings, transcripts, sync issues, and stakeholders.",
        tenantId
      );
      
      const nodes = graphContext.nodes.map((n, idx) => ({
        id: String(idx + 1),
        label: n.label,
        type: n.type || 'Entity',
      }));

      const edges = graphContext.edges.map((e) => {
        const sourceNode = nodes.find(n => n.label === e.source);
        const targetNode = nodes.find(n => n.label === e.target);
        return {
          source: sourceNode ? sourceNode.id : "1",
          target: targetNode ? targetNode.id : "2",
          relation: e.relation,
        };
      });

      return {
        summary: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
        },
        communities: ["Product", "Engineering", "Commercial", "Support"],
        nodes,
        edges,
      };
    } catch (e) {
      return {
        summary: { totalNodes: 0, totalEdges: 0 },
        communities: [],
        nodes: [],
        edges: [],
      };
    }
  }
}

export const graphService = new GraphService();
