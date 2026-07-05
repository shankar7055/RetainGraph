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
        arr: tenant.billingTier === 'pro' ? 220000 : 85000,
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
