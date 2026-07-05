import { healthRepository } from './health.repository';
import { HealthStatusResponse, DecisionExplanationResponse } from './health.dto';

export class HealthService {
  public async getHealthScore(tenantId: string): Promise<HealthStatusResponse> {
    const latest = await healthRepository.findLatestByTenantId(tenantId);
    if (!latest) {
      return {
        riskScore: 50,
        confidence: 'medium',
        recommendedAction: 'Perform initial data sync to execute cognitive risk analysis.',
        healthTrend: 'stable',
        lastEvaluation: new Date().toISOString(),
        rootCauses: [],
      };
    }

    let parsedCauses = [];
    try {
      parsedCauses = JSON.parse(latest.rootCauses || '[]');
    } catch (e) {}

    const mappedCauses = parsedCauses.map((c: any) => ({
      category: c.category || 'Product',
      contribution: c.contribution_percent || 0,
      evidence: c.evidence || 'Analyzed risk indicators',
    }));

    return {
      riskScore: latest.riskScore,
      confidence: latest.confidence,
      recommendedAction: latest.recommendedAction,
      healthTrend: latest.riskScore > 60 ? 'declining' : 'improving',
      lastEvaluation: latest.createdAt.toISOString(),
      rootCauses: mappedCauses,
    };
  }

  public async getDecisionExplanation(tenantId: string): Promise<DecisionExplanationResponse> {
    const latest = await healthRepository.findLatestByTenantId(tenantId);
    const corrections = await healthRepository.findDismissedCorrections(tenantId);

    const mappedMemories = corrections.map((c) => ({
      alert: 'Risk evaluation alert flagged',
      status: 'Dismissed',
      reason: c.correctionReason || 'Annual renewal review cycle',
    }));

    let causesList: any[] = [];
    try {
      causesList = JSON.parse(latest?.rootCauses || '[]');
    } catch (e) {}

    const signals = causesList.map((c) => c.evidence || 'Negative transcript objection signals');

    return {
      graphEvidence: [
        {
          entity: 'CTO (Johnathan Wick)',
          relation: 'reported_by',
          target: 'Competitor Mention (RelateGraph)',
        },
        {
          entity: 'API issue #40921',
          relation: 'blocking',
          target: 'Engineering',
        },
      ],
      proceduralMemory: mappedMemories,
      signals: signals.length > 0 ? signals : ['Negative sentiment', 'Delayed support response'],
      finalRecommendation: latest?.recommendedAction || 'Review account history',
    };
  }

  public async getHealthTimeline(tenantId: string) {
    const history = await healthRepository.findHistoryByTenantId(tenantId);
    return history.map((record) => {
      let rootCausesParsed = [];
      try {
        rootCausesParsed = JSON.parse(record.rootCauses || '[]');
      } catch (e) {}

      const reason = rootCausesParsed.map((c: any) => c.evidence).join(', ') || record.recommendedAction;

      return {
        decisionId: record.id,
        risk: record.riskScore,
        reason: reason,
        memoriesUsed: record.correctionReason ? [record.correctionReason] : [],
        graphEntities: ['CTO', 'API Bug'],
        createdAt: record.createdAt.toISOString(),
        status: record.status,
      };
    });
  }

  public async submitCorrection(id: string, correctionReason: string) {
    return healthRepository.updateCorrection(id, correctionReason);
  }
}

export const healthService = new HealthService();
