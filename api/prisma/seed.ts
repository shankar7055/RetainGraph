import { PrismaClient } from '@prisma/client';
import { mockInteractions } from '../src/services/mockCogneeData';

const prisma = new PrismaClient();

const tenants = [
  { id: 'demo-tenant-123', name: 'Demo Company', billingTier: 'pro' },
  { id: 'globex-inc-tenant-id', name: 'Globex Inc', billingTier: 'pro' },
  { id: 'initech-corp-tenant-id', name: 'Initech Corp', billingTier: 'free' },
  { id: 'hooli-tenant-id', name: 'Hooli', billingTier: 'pro' }
];

const otherInteractions = [
  {
    tenantId: 'globex-inc-tenant-id',
    payload: 'Log update from Globex Inc: Staging data sync failed 4 times. System reported Neo4j driver timeout when executing Cognee entity extraction. Storage capacity usage is at 98%, causing API key validation delays.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    tenantId: 'globex-inc-tenant-id',
    payload: 'Log update from Globex Inc: Staging data sync failed 4 times. System reported Neo4j driver timeout when executing Cognee entity extraction. Storage capacity usage is at 98%, causing API key validation delays.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    tenantId: 'initech-corp-tenant-id',
    payload: 'Email from Initech Corp: CTO Johnathan Wick announced he is leaving the company next month. We need to schedule a meeting with our new onboarding director, Peter Gibbons, to review our current graph pipeline subscription.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    tenantId: 'initech-corp-tenant-id',
    payload: 'Email from Initech Corp: CTO Johnathan Wick announced he is leaving the company next month. We need to schedule a meeting with our new onboarding director, Peter Gibbons, to review our current graph pipeline subscription.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    tenantId: 'hooli-tenant-id',
    payload: 'Account AE Sync notes: Hooli CEO Gavin Belson is extremely pleased with the cognitive search latency benchmarks. All staging validation runs are passing. They are requesting to upgrade their tenant tier from Free to Enterprise next week.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000)
  },
  {
    tenantId: 'hooli-tenant-id',
    payload: 'Account AE Sync notes: Hooli CEO Gavin Belson is extremely pleased with the cognitive search latency benchmarks. All staging validation runs are passing. They are requesting to upgrade their tenant tier from Free to Enterprise next week.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000)
  }
];

const healthChecks = [
  {
    tenantId: 'globex-inc-tenant-id',
    riskScore: 70,
    confidence: 'high',
    rootCauses: JSON.stringify([
      {
        category: 'Product',
        contribution_percent: 60,
        evidence: 'The customer is experiencing a sync failure alert, indicating a potential issue with the product’s integration functionality.'
      },
      {
        category: 'Support',
        contribution_percent: 30,
        evidence: 'The sync failure alert is logged as a ticket, suggesting that the support team has not yet resolved the issue.'
      },
      {
        category: 'Adoption',
        contribution_percent: 10,
        evidence: 'Repeated sync failures may hinder the customer’s adoption of the integration, reducing perceived value.'
      }
    ]),
    recommendedAction: 'Escalate the sync failure ticket to engineering, schedule a technical review with the CTO, and provide a temporary workaround to maintain integration uptime.'
  },
  {
    tenantId: 'initech-corp-tenant-id',
    riskScore: 10,
    confidence: 'medium',
    rootCauses: JSON.stringify([
      {
        category: 'Adoption',
        contribution_percent: 10,
        evidence: 'Only one integration (API Gateway) is documented; no other usage details are available.'
      }
    ]),
    recommendedAction: 'Schedule a usage review call with the CTO to assess adoption and identify any additional integration needs.'
  },
  {
    tenantId: 'hooli-tenant-id',
    riskScore: 80,
    confidence: 'high',
    rootCauses: JSON.stringify(['System health check scan completed.', 'Key executive transition / stakeholder departure.']),
    recommendedAction: 'Reach out to the new sponsor to review subscription tier.'
  }
];

async function main() {
  console.log('Seeding database with tenants, interactions, and health checks...');

  // 1. Seed tenants
  for (const t of tenants) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: { name: t.name, billingTier: t.billingTier },
      create: { id: t.id, name: t.name, billingTier: t.billingTier }
    });
    console.log(`Ensured tenant ${t.name} (${t.id}) exists.`);
  }

  // 2. Seed mock interactions for demo-tenant-123
  for (const mockData of mockInteractions) {
    const existing = await prisma.clientInteraction.findFirst({
      where: {
        tenantId: 'demo-tenant-123',
        payload: mockData.payload
      }
    });

    if (!existing) {
      await prisma.clientInteraction.create({
        data: {
          tenantId: 'demo-tenant-123',
          payload: mockData.payload,
          createdAt: mockData.createdAt,
          processed: true
        }
      });
    }
  }

  // 3. Seed other interactions
  for (const mockData of otherInteractions) {
    const existing = await prisma.clientInteraction.findFirst({
      where: {
        tenantId: mockData.tenantId,
        payload: mockData.payload
      }
    });

    if (!existing) {
      await prisma.clientInteraction.create({
        data: {
          tenantId: mockData.tenantId,
          payload: mockData.payload,
          createdAt: mockData.createdAt,
          processed: true
        }
      });
      console.log(`Inserted interaction for tenant ${mockData.tenantId}`);
    }
  }

  // 4. Seed health checks
  for (const hc of healthChecks) {
    const existing = await prisma.customerHealth.findFirst({
      where: {
        tenantId: hc.tenantId,
        riskScore: hc.riskScore
      }
    });

    if (!existing) {
      await prisma.customerHealth.create({
        data: {
          tenantId: hc.tenantId,
          riskScore: hc.riskScore,
          confidence: hc.confidence,
          rootCauses: hc.rootCauses,
          recommendedAction: hc.recommendedAction,
          status: 'active'
        }
      });
      console.log(`Inserted health check for tenant ${hc.tenantId}`);
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
