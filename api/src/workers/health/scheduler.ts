import cron, { ScheduledTask } from 'node-cron';
import { prisma } from '../../shared/config/prisma';
import { healthProcessor } from './processor';

export class HealthScheduler {
  private cronJob: ScheduledTask | null = null;

  public start() {
    console.log('[HealthScheduler] Starting health check cron scheduler (every minute)...');
    
    this.cronJob = cron.schedule('* * * * *', async () => {
      console.log(`[HealthScheduler] Cron sweep tick at ${new Date().toISOString()}`);
      try {
        const tenants = await prisma.tenant.findMany({ select: { id: true } });
        for (const t of tenants) {
          const latestHealth = await prisma.customerHealth.findFirst({
            where: { tenantId: t.id },
            orderBy: { createdAt: 'desc' },
          });

          const latestInteraction = await prisma.clientInteraction.findFirst({
            where: { tenantId: t.id },
            orderBy: { createdAt: 'desc' },
          });

          if (!latestInteraction) continue;

          if (!latestHealth || latestInteraction.createdAt > latestHealth.createdAt) {
            console.log(`[HealthScheduler] Tenant ${t.id} has new interactions. Triggering health processor...`);
            await healthProcessor.evaluateTenantHealth(t.id);
          }
        }
      } catch (error) {
        console.error('[HealthScheduler] Error during health cron sweep:', error);
      }
    });
  }

  public stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }
}

export const healthScheduler = new HealthScheduler();
