import { Request, Response } from 'express';
import { insightsService } from './insights.service';

export class InsightsController {
  public async getInsights(req: Request, res: Response) {
    try {
      const data = await insightsService.getActiveInsights();
      return res.json(data);
    } catch (error) {
      console.error('[InsightsController] Error fetching insights:', error);
      return res.status(500).json({ error: 'Failed to retrieve active insights list.' });
    }
  }
}

export const insightsController = new InsightsController();
