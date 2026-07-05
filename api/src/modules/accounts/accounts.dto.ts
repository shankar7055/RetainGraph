export interface AccountListItemResponse {
  id: string;
  company: string;
  logo: string;
  healthScore: number;
  risk: string;
  renewalDate: string;
  lastInteraction: string;
  owner: string;
  activeInsights: number;
  sentiment: string;
  trend: string;
  arr?: number;
}

export interface AccountDetailsResponse {
  summary: {
    company: string;
    healthScore: number;
    riskScore: number;
    confidence: string;
    renewalDays: number;
    arr: number;
    customerSince: string;
    overallSentiment: string;
  };
  timeline: any[];
  stakeholders: any[];
  health: any;
  insights: any[];
  documents: any[];
  metrics: any;
  recommendations: any[];
}
