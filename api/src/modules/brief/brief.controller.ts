import { Request, Response } from 'express';
import { briefService } from './brief.service';

export class BriefController {
  public async getBrief(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const brief = await briefService.getBrief(id);
      return res.json(brief);
    } catch (error) {
      console.error('[BriefController] Error generating brief:', error);
      return res.status(500).json({ error: 'Failed to generate pre-call briefing.' });
    }
  }
}

export const briefController = new BriefController();
