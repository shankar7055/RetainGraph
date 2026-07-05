import { prisma } from '../../shared/config/prisma';
import { ingestProcessor } from './processor';

export class IngestScheduler {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs = 10000; // 10 seconds

  public start() {
    console.log(`[IngestScheduler] Starting sweep loop every ${this.intervalMs / 1000}s`);
    this.timer = setInterval(async () => {
      try {
        const pending = await prisma.clientInteraction.findMany({
          where: { processed: false },
        });

        if (pending.length > 0) {
          console.log(`[IngestScheduler] Found ${pending.length} pending interactions to process.`);
          for (const item of pending) {
            await ingestProcessor.process(item);
          }
        }
      } catch (error) {
        console.error('[IngestScheduler] Error sweeping database:', error);
      }
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const ingestScheduler = new IngestScheduler();
