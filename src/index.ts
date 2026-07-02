import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { cogneeService } from './services/CogneeService';
import Groq from 'groq-sdk';
import { startHealthWorker, evaluateTenantHealth } from './workers/healthWorker';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

if (!process.env.GROQ_API_KEY) {
  console.error("FATAL ERROR: GROQ_API_KEY is not set in environment variables. The chat completion endpoint will not work.");
  process.exit(1);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Hardcoded demo tenant and API key
const DEMO_TENANT_ID = 'demo-tenant-123';
const DEMO_API_KEY = 'demo-key-456';

// Minimal auth middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== DEMO_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  // Retrieve the tenant ID from headers, or fallback to the demo tenant ID
  const tenantId = req.headers['x-tenant-id'] as string;
  (req as any).tenantId = tenantId || DEMO_TENANT_ID;
  next();
};

// Zod schema for validation
const ingestPayloadSchema = z.object({
  payload: z.string().min(1, "Payload cannot be empty"),
});

// POST endpoint to ingest unstructured client data
app.post('/api/interactions/ingest', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = ingestPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { payload } = result.data;

    // Save to Prisma DB linked to the specific tenant ID
    const interaction = await prisma.clientInteraction.create({
      data: {
        payload,
        tenantId,
      },
    });

    // Auto-trigger Cognee processing asynchronously
    cogneeService.processInteraction(interaction).catch(err => {
      console.error('Background Cognee processing failed:', err);
    });

    res.status(201).json({ message: 'Interaction ingested successfully', interaction });
  } catch (error) {
    console.error('Error ingesting interaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for manual trigger of pending interactions
app.post('/api/interactions/process', authenticate, async (req: Request, res: Response) => {
  try {
    // Fire off the batch process in the background
    cogneeService.processPendingInteractions().catch(err => {
      console.error('Manual trigger background processing failed:', err);
    });

    res.status(202).json({ message: 'Batch processing of pending interactions has been initiated' });
  } catch (error) {
    console.error('Error triggering processing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoints for frontend
app.get('/api/tenants', async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

app.get('/api/tenants/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id as string },
      include: {
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        interactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant details' });
  }
});

// POST endpoint for health correction (False Alarm)
app.post('/api/health/correct', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { healthRecordId, correctionReason } = req.body;

    if (!healthRecordId || !correctionReason) {
      return res.status(400).json({ error: 'healthRecordId and correctionReason are required' });
    }

    const health = await prisma.customerHealth.findUnique({ where: { id: healthRecordId } });

    if (!health || health.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Health record not found' });
    }

    await prisma.customerHealth.update({
      where: { id: healthRecordId },
      data: {
        status: 'dismissed',
        correctionReason: correctionReason
      }
    });

    await cogneeService.recordCorrection(tenantId, correctionReason);

    res.json({ success: true, message: 'Correction recorded successfully' });
  } catch (error) {
    console.error('Error in /api/health/correct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenants/:id/forget', authenticate, async (req: Request, res: Response) => {
  try {
    const authenticatedTenantId = (req as any).tenantId;
    const id = req.params.id as string;
    if (id !== authenticatedTenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await cogneeService.forgetTenant(id);

    const updatedHealth = await prisma.customerHealth.updateMany({
      where: { tenantId: id },
      data: { status: 'reset', resetAt: new Date() }
    });

    const updatedInteractions = await prisma.clientInteraction.updateMany({
      where: { tenantId: id },
      data: { processed: false }
    });

    res.json({
      success: true,
      message: `Memory reset successful for tenant ${id}`,
      healthRecordsReset: updatedHealth.count,
      interactionsRequeued: updatedInteractions.count
    });
  } catch (error) {
    console.error('Error in /api/tenants/:id/forget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const chatPayloadSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
});

// POST endpoint for streaming chat completions
app.post('/api/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = chatPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { question } = result.data;

    // 1. Fetch Context from Cognee
    let contextStr = "";
    try {
      contextStr = await cogneeService.searchContext(question, tenantId);
    } catch (err: any) {
      console.error('Failed to retrieve context:', err);
      // Return a distinctive error message if the graph isn't ready
      if (err.message.includes('not ready yet')) {
        return res.status(503).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Failed to retrieve context from knowledge graph.' });
    }

    // 2. Construct System Prompt
    const systemPrompt = `You are a helpful Customer Success AI Assistant. 
You must answer the user's question ONLY based on the following account history context. 
If the answer is not contained within the context, explicitly say you do not have enough information. 
Do not make up or hallucinate information.

CONTEXT:
${contextStr}
`;

    // 3. Make streaming call to Groq API
    const chatCompletionStream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'openai/gpt-oss-20b',
      stream: true,
      temperature: 0.2,
    });

    // 4. Stream chunks back to client
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of chatCompletionStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    // Append context summary to the end of the stream
    res.write(`\n\n--- Context Summary ---\n${contextStr.substring(0, 300)}...`);

    res.end();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during chat completion.' });
    } else {
      res.end('\n[Error occurred during stream generation]');
    }
  }
});

// POST endpoint for naive chat completion (Comparison Baseline)
app.post('/api/chat/naive', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = chatPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { question } = result.data;

    // 1. Fetch Naive Context (only the latest interaction) from Prisma
    const latestInteraction = await prisma.clientInteraction.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    const contextStr = latestInteraction ? latestInteraction.payload : "No interactions found.";

    // 2. Construct System Prompt
    const systemPrompt = `You are a helpful Customer Success AI Assistant. 
You must answer the user's question ONLY based on the following account history context. 
If the answer is not contained within the context, explicitly say you do not have enough information. 
Do not make up or hallucinate information.

CONTEXT:
${contextStr}
`;

    // 3. Make streaming call to Groq API
    const chatCompletionStream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'openai/gpt-oss-20b',
      stream: true,
      temperature: 0.2,
    });

    // 4. Stream chunks back to client
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of chatCompletionStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    // Append context summary
    res.write(`\n\n--- Context Summary ---\n${contextStr}`);

    res.end();
  } catch (error) {
    console.error('Error in /api/chat/naive:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during chat completion.' });
    } else {
      res.end('\n[Error occurred during stream generation]');
    }
  }
});

app.get('/api/tenants/:id/health-history', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const history = await prisma.customerHealth.findMany({
      where: { tenantId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        riskScore: true,
        confidence: true,
        createdAt: true,
        status: true
      }
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenants/:id/generate-email', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Fetch latest active health record for recommendedAction
    const latestHealth = await prisma.customerHealth.findFirst({
      where: { tenantId: id, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestHealth) {
      return res.status(404).json({ error: 'No active health record found for this tenant.' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    // Get Cognee Context
    const query = "Summarize this account's relationship history, key contacts, and recent concerns";
    let cogneeContext = "";
    try {
      cogneeContext = await cogneeService.searchContext(query, id);
    } catch (e) {
      console.warn("Failed to get cognee context for email generation", e);
    }

    const systemPrompt = `You are a professional Customer Success Manager drafting an outreach email to a client.
Client Company: ${tenant.name}
Recommended Next Step (Internal): ${latestHealth.recommendedAction}

Account History & Context:
${cogneeContext}

Instructions:
1. Write a professional, empathetic outreach email to the client addressing their recent concerns.
2. Explicitly reference specific issues from the account history instead of using generic filler.
3. Propose a concrete next step that aligns with the internal recommended action.
4. Keep the email between 150-200 words. Maintain a warm but professional tone.
5. Return ONLY a valid JSON object in the exact format below, with NO markdown formatting, NO backticks, and NO extra text:
{
  "subject": "The email subject",
  "body": "The full email body text."
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Draft the email as JSON." }
      ],
      model: "openai/gpt-oss-20b",
      max_tokens: 1000,
    });

    let responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    responseContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const emailData = JSON.parse(responseContent);

    res.json({
      subject: emailData.subject || "Checking in",
      body: emailData.body || "Could not generate email body."
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tenants/:id/graph-stats', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Prisma Stats
    const totalInteractions = await prisma.clientInteraction.count({ where: { tenantId: id } });
    const processedInteractions = await prisma.clientInteraction.count({ where: { tenantId: id, processed: true } });

    const oldestInteraction = await prisma.clientInteraction.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: 'asc' }
    });

    const newestInteraction = await prisma.clientInteraction.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Cognee Stats
    let nodeCount = null;
    let edgeCount = null;

    if (process.env.COGNEE_MOCK_MODE !== 'true') {
      const cogneeStats = await cogneeService.getGraphStats(id);
      if (cogneeStats) {
        nodeCount = cogneeStats.nodeCount;
        edgeCount = cogneeStats.edgeCount;
      }
    }

    res.json({
      totalInteractions,
      processedInteractions,
      oldestMemoryDate: oldestInteraction?.createdAt || null,
      newestMemoryDate: newestInteraction?.createdAt || null,
      nodeCount,
      edgeCount,
      datasetId: id
    });
  } catch (error) {
    console.error('Error fetching graph stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patterns', authenticate, async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string || "Which accounts are reporting API reliability issues?";

    if (process.env.COGNEE_MOCK_MODE !== "false") {
      return res.json({
        query,
        summary: "Multiple accounts have reported severe platform instability during peak hours, culminating in complete dashboard lockouts.",
        commonRootCause: "API Reliability Issues",
        affectedTenants: [
          {
            name: "Demo Company",
            riskScore: 85,
            evidence: "Urgent platform outage during a live demo."
          },
          {
            name: "Acme Corp",
            riskScore: 78,
            evidence: "Constantly crashing when trying to load the analytics dashboard."
          }
        ]
      });
    }

    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });
    const tenantIds = tenants.map(t => t.id);

    const contextStr = await cogneeService.searchContext(query, tenantIds);

    const systemPrompt = `You are a Customer Success AI evaluating patterns across multiple accounts.
Analyze the provided cross-account context to identify shared systemic issues related to: "${query}".
Return a JSON object with the following structure:
{
  "summary": "A brief paragraph summarizing the common thread across the affected accounts.",
  "commonRootCause": "A 2-5 word label for the issue",
  "affectedTenants": [
    {
      "name": "Tenant Name",
      "riskScore": (estimated 0-100 risk score based on severity),
      "evidence": "A specific quote or summary of how this tenant experienced the issue"
    }
  ]
}
IMPORTANT: Output ONLY valid JSON, no markdown fences, no commentary.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context:\n${contextStr}\n\nQuery: ${query}` }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (err) {
      console.warn("Failed to parse pattern detection JSON:", responseContent);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json({
      query,
      ...parsedResponse
    });
  } catch (error) {
    console.error('Error in /api/patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual Health Worker Trigger
app.post('/api/tenants/:id/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const authenticatedTenantId = (req as any).tenantId;

    if (id !== authenticatedTenantId) {
      return res.status(403).json({ error: 'Forbidden: API key does not match tenant ID' });
    }

    const healthRecord = await evaluateTenantHealth(id);
    if (!healthRecord) {
      return res.status(400).json({ error: 'Evaluation failed or no context found' });
    }

    res.json(healthRecord);
  } catch (error) {
    console.error('Error running manual analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// A seed script to ensure the demo tenant exists
const ensureDemoTenant = async () => {
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
};

const checkGroqModel = async () => {
  try {
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

  // Start the background health worker
  startHealthWorker();

  console.log(`Server is running on http://localhost:${PORT}`);
});
