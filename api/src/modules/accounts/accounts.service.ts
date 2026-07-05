import { accountRepository } from './accounts.repository';
import { AccountListItemResponse, AccountDetailsResponse } from './accounts.dto';

export class AccountsService {
  public async getAccountsList(): Promise<AccountListItemResponse[]> {
    const tenants = await accountRepository.findAll();
    return tenants.map((t) => {
      const latestHealth = t.healthChecks[0];
      const riskScore = latestHealth ? latestHealth.riskScore : 50;
      const confidence = latestHealth ? latestHealth.confidence : 'medium';
      
      let riskLevel = 'LOW';
      if (riskScore >= 70) riskLevel = 'HIGH';
      else if (riskScore >= 40) riskLevel = 'MEDIUM';

      let arrValue = 85000;
      const lowerName = t.name.toLowerCase();
      if (lowerName.includes('hooli')) arrValue = 250000;
      else if (lowerName.includes('globex')) arrValue = 185000;
      else if (lowerName.includes('initech')) arrValue = 95000;
      else if (lowerName.includes('acme') || lowerName.includes('demo') || lowerName.includes('company')) arrValue = 120000;
      else if (t.billingTier === 'pro') arrValue = 220000;

      return {
        id: t.id,
        company: t.name,
        logo: t.name.substring(0, 2).toUpperCase(),
        healthScore: 100 - riskScore,
        risk: riskLevel,
        renewalDate: 'Oct 12, 2026',
        lastInteraction: t.interactions[0]?.createdAt.toISOString() || 'No interactions',
        owner: 'Sarah Jenkins',
        activeInsights: latestHealth ? 2 : 0,
        sentiment: riskScore >= 70 ? 'Negative' : 'Positive',
        trend: riskScore >= 70 ? 'Down' : 'Stable',
        arr: arrValue,
      };
    });
  }

  public async getAccountDetails(id: string): Promise<AccountDetailsResponse> {
    const tenant = await accountRepository.findById(id);
    if (!tenant) {
      throw new Error(`Account not found for ID: ${id}`);
    }

    const latestHealth = tenant.healthChecks[0];
    const riskScore = latestHealth ? latestHealth.riskScore : 50;

    return {
      summary: {
        company: tenant.name,
        healthScore: 100 - riskScore,
        riskScore: riskScore,
        confidence: latestHealth ? latestHealth.confidence : 'medium',
        renewalDays: 98,
        arr: (() => {
          const lowerName = tenant.name.toLowerCase();
          if (lowerName.includes('hooli')) return 250000;
          if (lowerName.includes('globex')) return 185000;
          if (lowerName.includes('initech')) return 95000;
          if (lowerName.includes('acme') || lowerName.includes('demo') || lowerName.includes('company')) return 120000;
          return tenant.billingTier === 'pro' ? 220000 : 85000;
        })(),
        customerSince: '2023',
        overallSentiment: riskScore >= 70 ? 'Negative' : 'Positive',
      },
      timeline: tenant.interactions.map((i) => ({
        id: i.id,
        type: 'support_log',
        timestamp: i.createdAt.toISOString(),
        summary: 'Synchronized log event metadata',
        status: i.processed ? 'processed' : 'pending',
        entities: ['API Gateway', 'CTO', 'Error logs'],
        sentiment: 'Neutral',
      })),
      stakeholders: [
        { name: 'Johnathan Wick', role: 'Decision Maker (CTO)', sentiment: 'Neutral' },
        { name: 'Helen Cho', role: 'Technical Sponsor', sentiment: 'Positive' },
      ],
      health: {
        score: 100 - riskScore,
        lastCheck: latestHealth ? latestHealth.createdAt.toISOString() : 'Never',
      },
      insights: [
        {
          id: 'ins-1',
          category: 'Product',
          summary: 'Adoption drop of 40% on api integrations.',
          resolved: false,
        },
      ],
      documents: [
        { title: 'Slack Sync Channel #acme-success', syncDate: '2 hours ago' },
        { title: 'Support ticket transcript #40921', syncDate: '1 day ago' },
      ],
      metrics: {
        apiCalls: 124000,
        errorRate: '1.2%',
      },
      recommendations: [
        { title: 'Trigger Cognee pipeline rebuild', priority: 'High' },
      ],
    };
  }
}

export const accountsService = new AccountsService();
