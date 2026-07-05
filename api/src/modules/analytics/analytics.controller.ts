import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';

export class AnalyticsController {
  public async getAnalytics(req: Request, res: Response) {
    try {
      const data = await analyticsService.getAnalyticsData();
      return res.json(data);
    } catch (error) {
      console.error('[AnalyticsController] Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to retrieve analytics metrics.' });
    }
  }
}

export const analyticsController = new AnalyticsController();
