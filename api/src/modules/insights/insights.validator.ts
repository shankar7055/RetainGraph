import { Request, Response, NextFunction } from 'express';

export const validateInsightsQuery = (req: Request, res: Response, next: NextFunction) => {
  next();
};
