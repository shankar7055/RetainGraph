import { Request, Response, NextFunction } from 'express';

export const validateOverviewQuery = (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = req.query;
  if (!tenantId) {
    req.query.tenantId = 'demo-tenant-123'; // Default to demo tenant if missing
  }
  next();
};
