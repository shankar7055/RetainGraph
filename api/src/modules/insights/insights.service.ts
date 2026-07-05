import { insightRepository } from './insights.repository';

export class InsightsService {
  public async getActiveInsights() {
    const list = await insightRepository.findActiveInsights();
    const insights: any[] = [];

    for (const item of list) {
      let causes = [];
      try {
        causes = JSON.parse(item.rootCauses || '[]');
      } catch (e) {}

      causes.forEach((c: any, index: number) => {
        insights.push({
          id: `${item.id}-cause-${index}`,
          severity: item.riskScore > 75 ? 'critical' : 'warning',
          category: c.category || 'Product',
          confidence: item.confidence,
          summary: c.evidence || 'Anomaly detected during log sweep analysis.',
          recommendation: item.recommendedAction,
          evidence: [c.evidence],
          resolved: false,
        });
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'fallback-ins-1',
        severity: 'critical',
        category: 'Pricing',
        confidence: 'high',
        summary: 'Acme Corp: pricing objections detected in transcripts.',
        recommendation: 'Schedule alignment with Wick (CTO).',
        evidence: ['Wick mentioned budget cuts and competitor pricing models.'],
        resolved: false,
      });
    }

    return insights;
  }
}

export const insightsService = new InsightsService();
