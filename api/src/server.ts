import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';
import { ingestRouter } from './routes/ingest';
import { chatRouter } from './routes/chat';
import { accountsRouter } from './routes/accounts';

// Import new modular routes
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { accountsRoutes } from './modules/accounts/accounts.routes';
import { healthRoutes } from './modules/health/health.routes';
import { graphRoutes } from './modules/graph/graph.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { insightsRoutes } from './modules/insights/insights.routes';
import { briefRoutes } from './modules/brief/brief.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { systemRoutes } from './modules/system/system.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Legacy endpoints
app.use('/api', ingestRouter);
app.use('/api', chatRouter);
app.use('/api/accounts', accountsRouter);

// New Versioned Enterprise endpoints
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', accountsRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1', graphRoutes);
app.use('/api/v1', analyticsRoutes);
app.use('/api/v1', insightsRoutes);
app.use('/api/v1', briefRoutes);
app.use('/api/v1', chatRoutes);
app.use('/api/v1', systemRoutes);

const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || 'demo-tenant-123';

// Seed demo tenant if missing
const ensureDemoTenant = async () => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: DEMO_TENANT_ID },
    });

    if (!tenant) {
      await prisma.tenant.create({
        data: {
          id: DEMO_TENANT_ID,
          name: 'Demo Company',
          billingTier: 'pro',
        },
      });
      console.log('Demo tenant created.');
    }
  } catch (error) {
    console.error('Failed to seed demo tenant:', error);
  }
};

const checkGroqModel = async () => {
  try {
    if (!process.env.GROQ_API_KEY) return;
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    const targetModel = data.data?.find((m: any) => m.id === 'openai/gpt-oss-20b');

    if (!targetModel || !targetModel.active) {
      console.warn('WARNING: Target model "openai/gpt-oss-20b" is missing or inactive on Groq! The chat endpoint may fail.');
    } else {
      console.log('Groq model check passed: openai/gpt-oss-20b is active.');
    }
  } catch (error) {
    console.warn('WARNING: Failed to check Groq models during startup:', error);
  }
};

app.listen(PORT, async () => {
  await ensureDemoTenant();
  await checkGroqModel();
  console.log(`Server is running on http://localhost:${PORT}`);
});
