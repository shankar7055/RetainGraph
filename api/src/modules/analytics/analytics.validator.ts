import { Request, Response, NextFunction } from 'express';

export const validateAnalyticsQuery = (req: Request, res: Response, next: NextFunction) => {
  next();
};
