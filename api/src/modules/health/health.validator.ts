import { Request, Response, NextFunction } from 'express';

export const validateHealthParams = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing required account ID parameter.' });
  }
  next();
};

export const validateCorrectionInput = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { correctionReason } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing health audit ID parameter.' });
  }
  if (!correctionReason) {
    return res.status(400).json({ error: 'Missing required correctionReason body parameter.' });
  }
  next();
};
