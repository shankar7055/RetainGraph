import { accountRepository } from '../accounts/accounts.repository';
import { analyticsRepository } from '../analytics/analytics.repository';
import { insightRepository } from '../insights/insights.repository';
import { cogneeGateway } from '../../ai/gateways/CogneeGateway';
import { DashboardOverviewResponse } from './dashboard.dto';

export class DashboardService {
  public async getOverview(tenantId: string): Promise<DashboardOverviewResponse> {
    const tenants = await accountRepository.findAll();
    const totalAccounts = tenants.length;

    let healthyAccounts = 0;
    let warningAccounts = 0;
    let criticalAccounts = 0;
    let scoreSum = 0;

    for (const tenant of tenants) {
      const latestHealth = tenant.healthChecks[0];
      const score = latestHealth ? latestHealth.riskScore : 50; // default 50
      scoreSum += score;
      if (score < 40) {
        healthyAccounts++;
      } else if (score < 70) {
        warningAccounts++;
      } else {
        criticalAccounts++;
      }
    }

    const avgRisk = totalAccounts > 0 ? Math.round(scoreSum / totalAccounts) : 50;
    const portfolioHealthScore = 100 - avgRisk;

    // Get Cognee stats
    let graphNodes = 2842;
    let graphEdges = 9211;
    try {
      const stats = await cogneeGateway.getSchemaInventory(tenantId);
      if (stats && Array.isArray(stats)) {
        graphNodes = stats.reduce((sum, item) => sum + (item.count || 0), 0);
      }
    } catch (e) {
      // Keep fallback values in mock/offline mode
    }

    const interactionsToday = await analyticsRepository.getInteractionsTodayCount();
    const activeInsights = await insightRepository.findActiveInsights();

    const activeHealth = tenants.find(t => t.id === tenantId)?.healthChecks?.[0];
    const recId = activeHealth ? activeHealth.id : 'rec-1';

    return {
      portfolio: {
        healthScore: portfolioHealthScore,
        healthyAccounts,
        warningAccounts,
        criticalAccounts,
        totalAccounts,
      },
      statistics: {
        graphNodes,
        graphEdges,
        entitiesExtracted: Math.round(graphNodes * 0.4),
        interactionsToday,
        activeInsights: activeInsights.length,
      },
      workers: {
        ingestion: {
          status: 'running',
          processedToday: interactionsToday,
        },
        healthWorker: {
          status: 'running',
          evaluatedAccounts: totalAccounts,
        },
      },
      recentActivity: [
        {
          type: 'graph_update',
          title: 'Knowledge graph synced successfully',
          account: 'Acme Corp',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
        },
        {
          type: 'risk_detected',
          title: 'Critical Risk Alert flagged',
          severity: 'high',
          confidence: '94%',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      recommendations: [
        {
          id: recId,
          title: 'Schedule alignment with Johnathan Wick (CTO)',
          reason: 'Pricing concerns detected in recent support transcript log analysis.',
          impact: 'High',
          evidence: [
            {
              type: 'support_log',
              id: 'ticket-40921',
              summary: 'Wick scheduled call to negotiate renewal pricing due to competitive comparison with RelateGraph.'
            }
          ]
        },
      ],
    };
  }
}

export const dashboardService = new DashboardService();
