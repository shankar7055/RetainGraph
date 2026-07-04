import { PrismaClient, ClientInteraction } from '@prisma/client';
import { getMockCogneeContext } from './mockCogneeData';

const prisma = new PrismaClient();

export class CogneeService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.COGNEE_API_URL || 'https://api.cognee.ai';
    this.apiKey = process.env.COGNEE_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Warning: COGNEE_API_KEY is not set. Cognee API calls will likely fail.');
    }
  }

  private get headers() {
    return {
      'X-Api-Key': this.apiKey,
      'X-Tenant-Id': process.env.COGNEE_TENANT_ID || '',
    };
  }

  public async processPendingInteractions() {
    try {
      const pendingInteractions = await prisma.clientInteraction.findMany({
        where: { processed: false },
      });

      console.log(`Found ${pendingInteractions.length} pending interactions to process.`);

      for (const interaction of pendingInteractions) {
        await this.processInteraction(interaction);
      }
    } catch (error) {
      console.error('Error fetching pending interactions:', error);
    }
  }

  public async processInteraction(interaction: ClientInteraction) {
    console.log(`Processing interaction ${interaction.id} for tenant ${interaction.tenantId}...`);
    try {
      await this.addToCognee(interaction);
      await this.cognifyDataset(interaction.tenantId);

      // Mark as processed upon success of both
      await prisma.clientInteraction.update({
        where: { id: interaction.id },
        data: { processed: true },
      });
      console.log(`Successfully processed and marked interaction ${interaction.id} as processed.`);
    } catch (error) {
      console.error(`Failed to process interaction ${interaction.id}:`, error);
    }
  }

  private async addToCognee(interaction: ClientInteraction) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      console.log(`[MOCK] Intercepted Cognee POST /api/v1/add for dataset ${interaction.tenantId}. Skipping real HTTP call.`);
      return;
    }

    const endpoint = `${this.apiUrl}/api/v1/add`;
    const formData = new FormData();
    
    // Convert the payload string to a Blob so Cognee processes it as a text file
    const textBlob = new Blob([interaction.payload], { type: 'text/plain' });
    formData.append('data', textBlob, `interaction_${interaction.id}.txt`);
    formData.append('datasetName', interaction.tenantId);

    console.log(`[Cognee POST /api/v1/add] Uploading payload for dataset ${interaction.tenantId}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.headers,
      body: formData, // fetch will automatically set the correct multipart/form-data boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cognee ADD API Error (${response.status}): ${errorText}`);
    }

    console.log(`[Cognee POST /api/v1/add] Success: uploaded interaction ${interaction.id}`);
  }

  private async cognifyDataset(tenantId: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      console.log(`[MOCK] Intercepted Cognee POST /api/v1/cognify for dataset ${tenantId}. Skipping real HTTP call.`);
      return;
    }

    const endpoint = `${this.apiUrl}/api/v1/cognify`;
    
    const body = {
      datasets: [tenantId]
    };

    console.log(`[Cognee POST /api/v1/cognify] Triggering graph construction for dataset ${tenantId}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cognee COGNIFY API Error (${response.status}): ${errorText}`);
    }

    console.log(`[Cognee POST /api/v1/cognify] Success: dataset ${tenantId} is being cognified.`);
  }

  public async searchContext(query: string, tenantIds: string | string[]): Promise<string> {
    const datasetIds = Array.isArray(tenantIds) ? tenantIds : [tenantIds];
    const logDatasetName = datasetIds.join(', ');

    if (process.env.COGNEE_MOCK_MODE !== "false") {
      console.log(`[MOCK] Intercepted Cognee POST /api/v1/search for dataset(s) ${logDatasetName}. Returning mock historical graph context.`);
      return Array.isArray(tenantIds) ? JSON.stringify({ mock: 'mock cross-tenant context' }) : getMockCogneeContext(tenantIds);
    }

    const endpoint = `${this.apiUrl}/api/v1/search`;
    
    const body = {
      query: query,
      search_type: "GRAPH_COMPLETION",
      datasets: datasetIds,
      only_context: true
    };

    console.log(`[Cognee POST /api/v1/search] Searching graph context for dataset(s) ${logDatasetName}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Handle the case where the graph isn't ready distinct from a hard failure
      if (response.status === 404 || errorText.includes('not found') || errorText.includes('empty')) {
        throw new Error(`Graph dataset for ${logDatasetName} not ready yet. Please wait for cognify to finish. Details: ${errorText}`);
      }
      throw new Error(`Cognee SEARCH API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const contextPreview = JSON.stringify(data).substring(0, 150) + '...';
    console.log(`[Cognee POST /api/v1/search] Success: retrieved context. Preview: ${contextPreview}`);
    
    return JSON.stringify(data);
  }

  public async recordCorrection(tenantId: string, correctionReason: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      console.log(`[MOCK] Intercepted recordCorrection for tenant ${tenantId}.`);
      console.log(`[MOCK] Payload that WOULD be sent to Cognee's improve/feedback endpoint:`);
      console.log(`[MOCK] { correctionReason: "${correctionReason}" }`);
      console.log(`[MOCK] Note: Local Prisma persistence handles the actual feedback loop for now.`);
      return;
    }

    // WEDNESDAY LIVE API CHECK COMPLETE:
    // After parsing the live OpenAPI spec for the tenant, there is NO POST /api/v1/improve endpoint.
    // The closest match is /api/v1/remember/entry which requires a `qa_id` (not applicable for our searchContext usage).
    // Therefore, we are correctly relying on our Prisma-backed procedural memory (healthWorker.ts) as the 
    // single source of truth for corrections.
    console.log(`[Cognee] recordCorrection skipped on live environment - persisting locally in Prisma instead.`);
  }

  public async forgetTenant(tenantId: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      console.log(`[MOCK] Would call Cognee forget/prune for dataset ${tenantId}`);
      return;
    }

    const endpoint = `${this.apiUrl}/api/v1/forget`;
    const body = {
      dataset: tenantId
    };

    console.log(`[Cognee POST /api/v1/forget] Forgetting dataset ${tenantId}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cognee FORGET API Error (${response.status}): ${errorText}`);
    }

    console.log(`[Cognee POST /api/v1/forget] Success: forgot dataset ${tenantId}`);
  }

  public async getGraphStats(tenantId: string) {
    try {
      // 1. Get datasets to find the dataset UUID for this tenant
      const datasetsRes = await fetch(`${this.apiUrl}/api/v1/datasets`, {
        headers: this.headers
      });
      if (!datasetsRes.ok) return null;
      
      const datasets = await datasetsRes.json();
      const dataset = datasets.find((d: any) => d.name === tenantId);
      if (!dataset) return null;

      // 2. Get schema inventory
      const schemaRes = await fetch(`${this.apiUrl}/api/v1/schema/inventory?dataset_id=${dataset.id}`, {
        headers: this.headers
      });
      if (!schemaRes.ok) return null;

      const inventory = await schemaRes.json();
      let nodeCount = 0;
      let edgeCount = 0;

      for (const item of inventory) {
        nodeCount += (item.count || 0);
        if (item.relationships) {
          for (const rel of item.relationships) {
            edgeCount += (rel.count || 0);
          }
        }
      }

      return { nodeCount, edgeCount };
    } catch (e) {
      console.warn("Failed to fetch graph stats from Cognee:", e);
      return null;
    }
  }
}

export const cogneeService = new CogneeService();
