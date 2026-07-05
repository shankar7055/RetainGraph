import { Request, Response, NextFunction } from 'express';

export const validateChatRequest = (req: Request, res: Response, next: NextFunction) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing required question body parameter.' });
  }
  next();
};
