import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cogneeService } from '../services/cognee';
import { groq } from '../services/groq';
import { authenticate } from '../middleware/tenant';
import { evaluateTenantHealth } from '../workers/healthWorker';

export const accountsRouter = Router();

// GET all tenants
accountsRouter.get('/tenants', async (req: Request, res: Response) => {
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

// GET single tenant details
accountsRouter.get('/tenants/:id', async (req: Request, res: Response) => {
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

// POST health correction (False Alarm)
accountsRouter.post('/health/correct', authenticate, async (req: Request, res: Response) => {
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

// POST forget tenant memory
accountsRouter.post('/tenants/:id/forget', authenticate, async (req: Request, res: Response) => {
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

// GET tenant health history
accountsRouter.get('/tenants/:id/health-history', authenticate, async (req: Request, res: Response) => {
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

// POST generate outreach email
accountsRouter.post('/tenants/:id/generate-email', authenticate, async (req: Request, res: Response) => {
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

// GET graph stats
accountsRouter.get('/tenants/:id/graph-stats', authenticate, async (req: Request, res: Response) => {
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

// GET pattern summary across accounts
accountsRouter.get('/patterns', authenticate, async (req: Request, res: Response) => {
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

// POST run manual evaluation
accountsRouter.post('/tenants/:id/analyze', authenticate, async (req: Request, res: Response) => {
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
