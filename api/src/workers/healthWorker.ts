import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { cogneeService } from '../services/cognee';
import { groq } from '../services/groq';
import { SecureCrypto } from '../ai/services/SecureCrypto';

export const evaluateTenantHealth = async (tenantId: string) => {
  try {
    // 1. Fetch historical context from Cognee
    const contextStr = await cogneeService.searchContext(
      "Retrieve recent issues, sentiment, and risks for the account.",
      tenantId
    );

    // Fetch procedural memory (past corrections)
    const pastCorrections = await prisma.customerHealth.findMany({
      where: { tenantId, status: 'dismissed', correctionReason: { not: null } },
      orderBy: { createdAt: 'desc' }
    });
    
    let proceduralMemoryBlock = '';
    if (pastCorrections.length > 0) {
      proceduralMemoryBlock = `\n\n[PROCEDURAL MEMORY / FALSE ALARM HISTORY]
A Customer Success Manager previously dismissed alerts for this account with the following corrections:
${pastCorrections.map(c => `- "${c.correctionReason}"`).join('\n')}

CRITICAL INSTRUCTION: Take this feedback into account. Do not flag similar non-issues again unless new evidence strongly contradicts the correction. Adjust your risk score and confidence accordingly.`;
    }

    // 2. Call Groq with JSON mode
    const systemPrompt = `You are an expert Customer Success Analyst. Evaluate the account health based ONLY on the provided context.
    
    You must respond in strict JSON format. Do not use markdown blocks like \`\`\`json. Return only the raw JSON object.
    
    Expected JSON schema:
    {
      "risk_score": <integer from 0 to 100, where 100 is maximum risk of churn>,
      "confidence": <string: "high", "medium", or "low">,
      "root_causes": [
        {
          "category": <string: one of "Product", "Engineering", "Support", "Commercial", "Competitive", "Adoption">,
          "contribution_percent": <integer 0-100>,
          "evidence": <string describing why this category is a risk based on context>
        }
      ],
      "recommended_action": <string: specific recommended next step>
    }
    
    Context:
    ${contextStr}
    ${proceduralMemoryBlock}
    `;

    console.log(`[Worker] Prompt for tenant ${tenantId} generated. Procedural memory injected: ${pastCorrections.length > 0}`);
    if (pastCorrections.length > 0) {
      console.log(`[Worker] Injected Procedural Memory Block: ${proceduralMemoryBlock}`);
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';

    // 3. Parse and Store
    let parsedData;
    try {
      parsedData = JSON.parse(responseContent);
    } catch (e) {
      console.error(`[Worker] Failed to parse JSON for tenant ${tenantId}. Raw response: ${responseContent}`);
      return; // Skip storing if parsing fails
    }

    const { risk_score, confidence, root_causes, recommended_action } = parsedData;

    if (risk_score === undefined) {
       console.error(`[Worker] Missing risk_score in response for tenant ${tenantId}. Raw response: ${responseContent}`);
       return;
    }

    const encryptedRootCauses = SecureCrypto.encrypt(JSON.stringify(root_causes || []));
    const encryptedAction = SecureCrypto.encrypt(recommended_action || 'Review account history');

    const healthRecord = await prisma.customerHealth.create({
      data: {
        tenantId,
        riskScore: risk_score || 50,
        confidence: confidence || 'medium',
        rootCauses: encryptedRootCauses,
        recommendedAction: encryptedAction,
      },
    });

    console.log(`[Worker] Successfully evaluated health for tenant ${tenantId}. Score: ${risk_score}`);

    // 4. Alerting
    if (risk_score > 70) {
      const topCause = root_causes?.sort((a: any, b: any) => b.contribution_percent - a.contribution_percent)[0];
      console.log(`\n======================================================`);
      console.log(`🚨 [SIMULATED SLACK WEBHOOK] HIGH CHURN RISK ALERT 🚨`);
      console.log(`======================================================`);
      console.log(`Tenant: ${tenantId}`);
      console.log(`Risk Score: ${risk_score}/100 (Confidence: ${confidence})`);
      if (topCause) {
        console.log(`Top Root Cause: ${topCause.category} (${topCause.contribution_percent}%)`);
        console.log(`Evidence: ${topCause.evidence}`);
      }
      console.log(`Recommended Action: ${recommended_action}`);
      console.log(`======================================================\n`);
    }

    return healthRecord;

  } catch (error: any) {
    if (error.message?.includes('not ready yet')) {
      console.log(`[Worker] Skipping tenant ${tenantId}: Graph not ready yet.`);
    } else {
      console.error(`[Worker] Error evaluating health for tenant ${tenantId}:`, error);
    }
  }
};

export const startHealthWorker = () => {
  console.log('[Worker] Starting Proactive Intelligence Worker (1-minute schedule).');

  cron.schedule('* * * * *', async () => {
    console.log(`[Worker] Cron tick at ${new Date().toISOString()} - Checking for qualifying tenants...`);
    
    try {
      // Find all distinct tenants who have at least one interaction
      const tenants = await prisma.tenant.findMany({
        select: { id: true },
      });

      for (const t of tenants) {
        // Get the latest health check
        const latestHealth = await prisma.customerHealth.findFirst({
          where: { tenantId: t.id },
          orderBy: { createdAt: 'desc' },
        });

        // Get the latest interaction
        const latestInteraction = await prisma.clientInteraction.findFirst({
          where: { tenantId: t.id },
          orderBy: { createdAt: 'desc' },
        });

        if (!latestInteraction) {
           continue; // No data at all
        }

        // Only process if there's an interaction newer than the last health check
        if (!latestHealth || latestInteraction.createdAt > latestHealth.createdAt) {
          console.log(`[Worker] Tenant ${t.id} qualifies for processing.`);
          await evaluateTenantHealth(t.id);
        }
      }
    } catch (error) {
      console.error('[Worker] Error during cron sweep:', error);
    }
  });
};
