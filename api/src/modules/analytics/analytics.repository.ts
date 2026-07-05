import { prisma } from '../../shared/config/prisma';

export class AnalyticsRepository {
  public async getInteractionsTodayCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.clientInteraction.count({
      where: {
        createdAt: { gte: today },
      },
    });
  }

  public async getUnprocessedInteractionsCount() {
    return prisma.clientInteraction.count({
      where: { processed: false },
    });
  }

  public async getAllInteractionsCount() {
    return prisma.clientInteraction.count();
  }

  public async getAverageRiskScore() {
    const agg = await prisma.customerHealth.aggregate({
      where: { status: 'active' },
      _avg: { riskScore: true },
    });
    return agg._avg.riskScore || 0;
  }
}

export const analyticsRepository = new AnalyticsRepository();
