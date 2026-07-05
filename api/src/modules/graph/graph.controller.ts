import { Request, Response } from 'express';
import { graphService } from './graph.service';

export class GraphController {
  public async getGraph(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await graphService.getGraphData(id);
      return res.json(data);
    } catch (error) {
      console.error('[GraphController] Error fetching graph:', error);
      return res.status(500).json({ error: 'Failed to retrieve cognitive knowledge graph nodes.' });
    }
  }
}

export const graphController = new GraphController();
