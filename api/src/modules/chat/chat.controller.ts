import { Request, Response } from 'express';
import { chatService } from './chat.service';

export class ChatController {
  public async askQuestion(req: Request, res: Response) {
    try {
      const { tenantId, accountId, question } = req.body;
      const tId = tenantId || 'demo-tenant-123';
      const answer = await chatService.askQuestion(tId, accountId, question);
      return res.json(answer);
    } catch (error) {
      console.error('[ChatController] Error in chat completion:', error);
      return res.status(500).json({ error: 'Failed to process AI copilot query.' });
    }
  }
}

export const chatController = new ChatController();
