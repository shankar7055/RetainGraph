import { prisma } from '../../shared/config/prisma';

import { SecureCrypto } from '../../ai/services/SecureCrypto';

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
    const list = await prisma.clientInteraction.findMany({
      select: { payload: true }
    });
    
    let emails = 0;
    let tickets = 0;
    let meetings = 0;

    for (const item of list) {
      const plaintext = SecureCrypto.decrypt(item.payload).toLowerCase();
      if (plaintext.includes('email') || plaintext.includes('thread')) {
        emails++;
      } else if (plaintext.includes('ticket') || plaintext.includes('bug')) {
        tickets++;
      } else if (plaintext.includes('transcript') || plaintext.includes('call') || plaintext.includes('sync')) {
        meetings++;
      }
    }

    const total = list.length;
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
