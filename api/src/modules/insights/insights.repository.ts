import { prisma } from '../../shared/config/prisma';

export class InsightRepository {
  public async findActiveInsights() {
    return prisma.customerHealth.findMany({
      where: {
        status: 'active',
        riskScore: { gt: 50 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const insightRepository = new InsightRepository();
