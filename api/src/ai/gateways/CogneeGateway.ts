import { getMockCogneeContext } from '../../services/mockCogneeData';
import dotenv from 'dotenv';
dotenv.config();

export class CogneeGateway {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.COGNEE_API_URL || 'https://api.cognee.ai';
    this.apiKey = process.env.COGNEE_API_KEY || '';
  }

  private get headers() {
    return {
      'X-Api-Key': this.apiKey,
      'X-Tenant-Id': process.env.COGNEE_TENANT_ID || '',
    };
  }

  public async addInteraction(id: string, payload: string, datasetName: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      return;
    }
    const endpoint = `${this.apiUrl}/api/v1/add`;
    const formData = new FormData();
    const textBlob = new Blob([payload], { type: 'text/plain' });
    formData.append('data', textBlob, `interaction_${id}.txt`);
    formData.append('datasetName', datasetName);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cognee ADD Error: ${err}`);
    }
  }

  public async cognify(datasetName: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      return;
    }
    const endpoint = `${this.apiUrl}/api/v1/cognify`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datasets: [datasetName] }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cognee COGNIFY Error: ${err}`);
    }
  }

  public async search(query: string, datasets: string[]): Promise<string> {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      return getMockCogneeContext(datasets[0] || 'demo-tenant-123');
    }
    const endpoint = `${this.apiUrl}/api/v1/search`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        search_type: "GRAPH_COMPLETION",
        datasets,
        only_context: true
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cognee SEARCH Error: ${err}`);
    }
    const data = await response.json();
    return JSON.stringify(data);
  }

  public async forget(datasetName: string) {
    if (process.env.COGNEE_MOCK_MODE !== "false") {
      return;
    }
    const endpoint = `${this.apiUrl}/api/v1/forget`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataset: datasetName }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cognee FORGET Error: ${err}`);
    }
  }

  public async getDatasets() {
    const response = await fetch(`${this.apiUrl}/api/v1/datasets`, {
      headers: this.headers,
    });
    if (!response.ok) return [];
    return response.json();
  }

  public async getSchemaInventory(datasetId: string) {
    const response = await fetch(`${this.apiUrl}/api/v1/schema/inventory?dataset_id=${datasetId}`, {
      headers: this.headers,
    });
    if (!response.ok) return [];
    return response.json();
  }
}

export const cogneeGateway = new CogneeGateway();
