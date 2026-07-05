export interface DashboardOverviewResponse {
  portfolio: {
    healthScore: number;
    healthyAccounts: number;
    warningAccounts: number;
    criticalAccounts: number;
    totalAccounts: number;
  };
  statistics: {
    graphNodes: number;
    graphEdges: number;
    entitiesExtracted: number;
    interactionsToday: number;
    activeInsights: number;
  };
  workers: {
    ingestion: {
      status: string;
      processedToday: number;
    };
    healthWorker: {
      status: string;
      evaluatedAccounts: number;
    };
  };
  recentActivity: any[];
  recommendations: any[];
}
