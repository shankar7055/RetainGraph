import { analyticsRepository } from './analytics.repository';

export class AnalyticsService {
  public async getAnalyticsData() {
    const totalInteractions = await analyticsRepository.getAllInteractionsCount();
    const avgRisk = await analyticsRepository.getAverageRiskScore();
    const portfolioHealth = 100 - avgRisk;

    return {
      customerHealthTrend: [
        { month: 'Jan', averageScore: 82 },
        { month: 'Mar', averageScore: 78 },
        { month: 'May', averageScore: portfolioHealth || 85 },
      ],
      riskDistribution: [
        { name: 'Low', count: 18 },
        { name: 'Medium', count: 4 },
        { name: 'High', count: 2 },
      ],
      interactionVolume: [
        { name: 'Processed', count: totalInteractions },
      ],
      revenueAtRisk: [
        { quarter: 'Q1', amount: 45000 },
        { quarter: 'Q2', amount: 92000 },
        { quarter: 'Q3', amount: 145000 },
      ],
    };
  }
}

export const analyticsService = new AnalyticsService();
