import { cogneeGateway } from '../../ai/gateways/CogneeGateway';

export class GraphService {
  public async getGraphData(tenantId: string) {
    let rawInventory = [];
    try {
      rawInventory = await cogneeGateway.getSchemaInventory(tenantId);
    } catch (e) {}

    const nodes = [
      { id: "1", label: tenantId, type: "Customer" },
      { id: "2", label: "Johnathan Wick", type: "CTO" },
      { id: "3", label: "RelateGraph", type: "Competitor" },
      { id: "4", label: "API Timeout issue", type: "Support" },
    ];

    const edges = [
      { source: "1", target: "2", relation: "has_cto" },
      { source: "1", target: "3", relation: "competing_with" },
      { source: "2", target: "4", relation: "reported" },
    ];

    return {
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
      },
      communities: ["Commercial", "Product", "Support"],
      nodes,
      edges,
    };
  }
}

export const graphService = new GraphService();
