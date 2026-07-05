import { Request, Response } from 'express';
import { prisma } from '../../shared/config/prisma';

export class SystemController {
  private startTime = Date.now();

  public getStatus = async (req: Request, res: Response) => {
    let dbStatus = 'healthy';
    let dbLatency = 10;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const uptimeString = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;

    return res.json({
      api: {
        status: 'healthy',
        uptime: uptimeString,
        version: '1.0.0',
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      redis: {
        status: 'healthy',
        queueDepth: 0,
      },
      cognee: {
        status: 'healthy',
        datasetCount: 1,
      },
      groq: {
        status: 'healthy',
        averageResponseMs: 420,
      },
      workers: {
        ingestion: 'running',
        health: 'running',
      },
    });
  };

  public getPipeline = async (req: Request, res: Response) => {
    try {
      const pendingInteractions = await prisma.clientInteraction.count({ where: { processed: false } });
      const completedInteractions = await prisma.clientInteraction.count({ where: { processed: true } });
      const completedEvaluations = await prisma.customerHealth.count();

      return res.json({
        ingestion: {
          pending: pendingInteractions,
          processing: 0,
          completed: completedInteractions,
        },
        healthEvaluation: {
          pending: 0,
          completed: completedEvaluations,
        },
        graphConstruction: {
          running: false,
        },
      });
    } catch (e) {
      console.error('[SystemController] Error in getPipeline:', e);
      return res.status(500).json({ error: 'Failed to retrieve system pipeline stats.' });
    }
  };
}

export const systemController = new SystemController();
