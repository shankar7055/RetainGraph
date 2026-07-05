import { Request, Response } from 'express';
import { healthService } from './health.service';

export class HealthController {
  public async getHealth(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const score = await healthService.getHealthScore(id);
      return res.json(score);
    } catch (error) {
      console.error('[HealthController] Error fetching health:', error);
      return res.status(500).json({ error: 'Failed to retrieve customer health evaluation.' });
    }
  }

  public async getDecisionExplanation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const explanation = await healthService.getDecisionExplanation(id);
      return res.json(explanation);
    } catch (error) {
      console.error('[HealthController] Error fetching explanation:', error);
      return res.status(500).json({ error: 'Failed to retrieve AI decision explanation.' });
    }
  }

  public getHealthTimeline = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const timeline = await healthService.getHealthTimeline(id);
      return res.json(timeline);
    } catch (error) {
      console.error('[HealthController] Error fetching health timeline:', error);
      return res.status(500).json({ error: 'Failed to retrieve health timeline history.' });
    }
  };

  public async submitCorrection(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { correctionReason } = req.body;
      const record = await healthService.submitCorrection(id, correctionReason);
      return res.json({ success: true, record });
    } catch (error) {
      console.error('[HealthController] Error submitting correction:', error);
      return res.status(500).json({ error: 'Failed to record CS correction.' });
    }
  }
}

export const healthController = new HealthController();
