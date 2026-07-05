export interface HealthStatusResponse {
  riskScore: number;
  confidence: string;
  recommendedAction: string;
  healthTrend: string;
  lastEvaluation: string;
  rootCauses: {
    category: string;
    contribution: number;
    evidence: string;
  }[];
}

export interface DecisionExplanationResponse {
  graphEvidence: {
    entity: string;
    relation: string;
    target: string;
  }[];
  proceduralMemory: {
    alert: string;
    status: string;
    reason: string;
  }[];
  signals: string[];
  finalRecommendation: string;
}
