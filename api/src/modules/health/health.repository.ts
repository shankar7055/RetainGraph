import { prisma } from '../../shared/config/prisma';

export class HealthRepository {
  public async findLatestByTenantId(tenantId: string) {
    return prisma.customerHealth.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findHistoryByTenantId(tenantId: string) {
    return prisma.customerHealth.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findDismissedCorrections(tenantId: string) {
    return prisma.customerHealth.findMany({
      where: {
        tenantId,
        status: 'dismissed',
        correctionReason: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: {
    tenantId: string;
    riskScore: number;
    confidence: string;
    rootCauses: string;
    recommendedAction: string;
  }) {
    return prisma.customerHealth.create({ data });
  }

  public async updateCorrection(id: string, correctionReason: string) {
    return prisma.customerHealth.update({
      where: { id },
      data: {
        status: 'dismissed',
        correctionReason,
        resetAt: new Date(),
      },
    });
  }
}

export const healthRepository = new HealthRepository();
