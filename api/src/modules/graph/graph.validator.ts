import { Request, Response, NextFunction } from 'express';

export const validateGraphParams = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing required account ID parameter.' });
  }
  next();
};
