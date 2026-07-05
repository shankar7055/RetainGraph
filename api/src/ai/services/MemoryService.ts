import { cogneeGateway } from '../gateways/CogneeGateway';
import { prisma } from '../../shared/config/prisma';

export interface GraphContext {
  summary: {
    totalNodes: number;
    totalEdges: number;
  };
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string; relation: string }[];
}

export class MemoryService {
  public async getGraphContext(query: string, tenantId: string): Promise<GraphContext> {
    try {
      const dataStr = await cogneeGateway.search(query, [tenantId]);
      console.log(`[MemoryService] getGraphContext dataStr length: ${dataStr.length}`);
      
      let nodes: { id: string; label: string; type: string }[] = [];
      let edges: { source: string; target: string; relation: string }[] = [];

      let parsed: any;
      try {
        parsed = JSON.parse(dataStr);
      } catch (e) {}

      // If it's an array of search result objects from real Cognee query
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const text = item.search_result || "";
          const lines = text.split("\n");
          let section: 'nodes' | 'connections' | null = null;
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === "Nodes:") {
              section = 'nodes';
              continue;
            } else if (trimmed === "Connections:") {
              section = 'connections';
              continue;
            }

            if (section === 'nodes' && trimmed.startsWith("Node:")) {
              const nodeText = trimmed.replace("Node:", "").trim();
              const tagMatch = nodeText.match(/(.*)\[(.*)\]$/);
              const label = tagMatch ? tagMatch[1].trim() : nodeText;
              const type = tagMatch ? tagMatch[2].split(',')[0].trim() : "Entity";
              
              if (label) {
                nodes.push({
                  id: label,
                  label,
                  type
                });
              }
            } else if (section === 'connections' && trimmed.includes("-->")) {
              const parts = trimmed.split("--[");
              if (parts.length === 2) {
                const source = parts[0].trim();
                const rest = parts[1].split("]-->");
                if (rest.length === 2) {
                  const relation = rest[0].trim();
                  const targetPart = rest[1].split(" (")[0].trim();
                  edges.push({
                    source,
                    target: targetPart,
                    relation
                  });
                }
              }
            }
          }
        }
      } else if (parsed && (parsed.nodes || parsed.edges)) {
        const parsedNodes = parsed.nodes || [];
        nodes = parsedNodes.map((n: any) => ({
          id: String(n.id || ''),
          label: String(n.name || n.label || ''),
          type: String(n.type || 'Entity')
        }));
        const parsedEdges = parsed.edges || [];
        edges = parsedEdges.map((e: any) => ({
          source: String(e.source || ''),
          target: String(e.target || ''),
          relation: String(e.relation || 'related_to')
        }));
      }

      // De-duplicate nodes
      const uniqueNodesMap = new Map();
      for (const n of nodes) {
        uniqueNodesMap.set(n.label, n);
      }
      const uniqueNodes = Array.from(uniqueNodesMap.values());

      return {
        summary: {
          totalNodes: uniqueNodes.length,
          totalEdges: edges.length,
        },
        nodes: uniqueNodes,
        edges,
      };
    } catch (error) {
      console.error('[MemoryService] Failed to retrieve graph context:', error);
      throw new Error(`Graph retrieval failed: ${(error as Error).message}`);
    }
  }

  public async getProceduralMemory(tenantId: string) {
    const dismissedAudits = await prisma.customerHealth.findMany({
      where: {
        tenantId,
        status: 'dismissed',
        correctionReason: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dismissedAudits.map((a) => ({
      decisionId: a.id,
      originalRisk: a.riskScore,
      correctionReason: a.correctionReason || '',
      dismissedAt: a.resetAt?.toISOString() || a.createdAt.toISOString(),
      originalCauses: a.rootCauses,
    }));
  }

  public async getLatestHealth(tenantId: string) {
    return prisma.customerHealth.findFirst({
      where: {
        tenantId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getOpenInsights() {
    return prisma.customerHealth.findMany({
      where: {
        status: 'active',
        riskScore: { gt: 50 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getRecentInteractions(tenantId: string) {
    return prisma.clientInteraction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}

export const memoryService = new MemoryService();
