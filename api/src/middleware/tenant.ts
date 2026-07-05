import { Request, Response, NextFunction } from 'express';

const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || 'demo-tenant-123';
const DEMO_API_KEY = process.env.DEMO_API_KEY || 'demo-key-456';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== DEMO_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  // Retrieve the tenant ID from headers, or fallback to the demo tenant ID
  const tenantId = req.headers['x-tenant-id'] as string;
  (req as any).tenantId = tenantId || DEMO_TENANT_ID;
  next();
};
