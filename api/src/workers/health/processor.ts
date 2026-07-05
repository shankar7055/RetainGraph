import { prisma } from '../../shared/config/prisma';
import { memoryService } from '../../ai/services/MemoryService';
import { reasoningService } from '../../ai/services/ReasoningService';
import { getHealthPrompt } from '../../ai/prompts/HealthPrompt';
import { healthRepository } from '../../modules/health/health.repository';

export class HealthProcessor {
  public async evaluateTenantHealth(tenantId: string) {
    try {
      console.log(`[HealthProcessor] Running health audit check for tenant ${tenantId}...`);
      
      const contextStr = await memoryService.getGraphContext(
        "Retrieve recent issues, sentiment, and risks for the account.",
        tenantId
      );

      const pastCorrections = await healthRepository.findDismissedCorrections(tenantId);
      
      console.log(`[HealthProcessor] Health Audit inputs loaded:`);
      console.log(`  - Graph Entities Retrieved: ${contextStr.nodes.length}`);
      console.log(`  - Graph Relationships Retrieved: ${contextStr.edges.length}`);
      console.log(`  - Procedural Memories / Dismissed Alerts Used: ${pastCorrections.length}`);

      let proceduralMemoryBlock = '';
      if (pastCorrections.length > 0) {
        proceduralMemoryBlock = `\n\n[PROCEDURAL MEMORY / FALSE ALARM HISTORY]
A Customer Success Manager previously dismissed alerts for this account with the following corrections:
${pastCorrections.map(c => `- "${c.correctionReason}"`).join('\n')}

CRITICAL INSTRUCTION: Take this feedback into account. Do not flag similar non-issues again unless new evidence strongly contradicts the correction. Adjust your risk score and confidence accordingly.`;
      }

      const prompt = getHealthPrompt(JSON.stringify(contextStr), proceduralMemoryBlock);
      const jsonResponse = await reasoningService.evaluateHealth(prompt);

      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (e) {
        console.error(`[HealthProcessor] Failed to parse JSON for tenant ${tenantId}:`, jsonResponse);
        return;
      }

      const { risk_score, confidence, root_causes, recommended_action } = parsedData;

      if (risk_score === undefined) {
        console.error(`[HealthProcessor] Missing risk_score in AI response:`, jsonResponse);
        return;
      }

      const healthRecord = await healthRepository.create({
        tenantId,
        riskScore: risk_score || 50,
        confidence: confidence || 'medium',
        rootCauses: JSON.stringify(root_causes || []),
        recommendedAction: recommended_action || 'Review account history',
      });

      console.log(`[HealthProcessor] Audited health for tenant ${tenantId}. Risk score: ${risk_score}`);

      // Alerting webhook simulation
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
        console.log(`[HealthProcessor] Skipping tenant ${tenantId}: Graph not ready yet.`);
      } else {
        console.error(`[HealthProcessor] Error evaluating health for tenant ${tenantId}:`, error);
      }
    }
  }
}

export const healthProcessor = new HealthProcessor();
