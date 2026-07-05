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

  public async getInteractionsBreakdown() {
    const total = await prisma.clientInteraction.count();
    const emails = await prisma.clientInteraction.count({ where: { payload: { contains: 'email' } } });
    const tickets = await prisma.clientInteraction.count({ where: { payload: { contains: 'ticket' } } });
    const meetings = await prisma.clientInteraction.count({ where: { payload: { contains: 'transcript' } } });
    const other = total - (emails + tickets + meetings);
    return { emails, tickets, meetings, other: other > 0 ? other : 0, total };
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
