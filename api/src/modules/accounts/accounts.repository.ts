import { prisma } from '../../shared/config/prisma';

export class AccountRepository {
  public async findAll() {
    return prisma.tenant.findMany({
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  public async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        healthChecks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

export const accountRepository = new AccountRepository();
