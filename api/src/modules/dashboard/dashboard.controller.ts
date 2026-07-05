import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  public async getOverview(req: Request, res: Response) {
    try {
      const tenantId = (req.query.tenantId as string) || 'demo-tenant-123';
      const overview = await dashboardService.getOverview(tenantId);
      return res.json(overview);
    } catch (error) {
      console.error('[DashboardController] Error fetching overview:', error);
      return res.status(500).json({ error: 'Failed to retrieve dashboard overview data.' });
    }
  }
}

export const dashboardController = new DashboardController();
