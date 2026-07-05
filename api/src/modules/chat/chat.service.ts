import { memoryService } from '../../ai/services/MemoryService';
import { getChatPrompt } from '../../ai/prompts/ChatPrompt';
import { reasoningService } from '../../ai/services/ReasoningService';

export class ChatService {
  public async askQuestion(tenantId: string, accountId: string, question: string) {
    const startTime = Date.now();
    const targetAccountId = accountId || tenantId || 'demo-tenant-123';

    console.log(`[ChatService] Executing grounded RAG pipeline for account: ${targetAccountId}`);

    // Retrieve Knowledge Graph Context (Throws controlled service exception if fails)
    const graphContext = await memoryService.getGraphContext(
      `Search for context resolving: ${question}`,
      targetAccountId
    );

    // Retrieve Procedural Memory (CSM alerts corrections history)
    const proceduralMemory = await memoryService.getProceduralMemory(targetAccountId);
    const proceduralMemoryStr = proceduralMemory.length > 0 
      ? proceduralMemory.map(m => `- [${m.dismissedAt}] Correction: "${m.correctionReason}" (Original Score: ${m.originalRisk})`).join('\n')
      : 'No previous alerts dismissed or corrections logged.';

    // Retrieve Latest Active Health Status
    const latestHealth = await memoryService.getLatestHealth(targetAccountId);
    const healthStr = latestHealth 
      ? `Risk Score: ${latestHealth.riskScore}/100, Confidence: ${latestHealth.confidence}, Recommended Action: "${latestHealth.recommendedAction}"`
      : 'No health audit check record currently logged.';

    // Retrieve Open Insights
    const openInsights = await memoryService.getOpenInsights();
    const insightsStr = openInsights.length > 0
      ? openInsights.map(i => `- Insight: "${i.recommendedAction}" (Risk: ${i.riskScore})`).join('\n')
      : 'No active unresolved insights flagged.';

    // Retrieve Recent Interactions
    const recentInteractions = await memoryService.getRecentInteractions(targetAccountId);
    const interactionsStr = recentInteractions.length > 0
      ? recentInteractions.map(i => `- [${i.createdAt.toISOString()}] ${i.payload}`).join('\n')
      : 'No client interaction logs found.';

    // Build Structured Prompt
    const graphContextStr = JSON.stringify(graphContext);
    const prompt = getChatPrompt(
      question,
      graphContextStr,
      proceduralMemoryStr,
      healthStr,
      insightsStr,
      interactionsStr
    );

    // Prompt Telemetry Logging
    console.log(`[ChatService] Prompt assembled. Size: ${prompt.length} chars. Dispaching to Reasoning Engine...`);

    // Call Groq and Parse JSON
    const responseJson = await reasoningService.getJsonResponse(prompt);
    
    let parsed;
    try {
      parsed = JSON.parse(responseJson);
    } catch (e) {
      console.error('[ChatService] Malformed JSON response returned by LLM:', responseJson);
      throw new Error('Reasoning engine returned a malformed response format.');
    }

    const elapsedMs = Date.now() - startTime;
    console.log(`[ChatService] RAG copilot run completed in ${elapsedMs}ms.`);

    return {
      answer: parsed.answer || "No response details compiled.",
      confidence: parsed.confidence || "medium",
      citations: parsed.citations || [],
      graphEntities: parsed.graphEntities || [],
      relatedEntities: parsed.relatedEntities || [],
      followUps: parsed.followUps || [],
      recommendations: parsed.recommendations || [],
      usedProceduralMemory: proceduralMemory,
      usedHealthEvaluation: latestHealth ? {
        id: latestHealth.id,
        riskScore: latestHealth.riskScore,
        confidence: latestHealth.confidence,
        recommendedAction: latestHealth.recommendedAction,
        createdAt: latestHealth.createdAt.toISOString()
      } : null,
      usedInsights: openInsights.map(i => ({
        id: i.id,
        riskScore: i.riskScore,
        recommendedAction: i.recommendedAction,
        createdAt: i.createdAt.toISOString()
      })),
      responseTimeMs: elapsedMs,
      model: 'openai/gpt-oss-20b',
    };
  }
}

export const chatService = new ChatService();
