export const mockInteractions = [
  {
    payload: "Kickoff Call Transcript: Acme launches with enthusiasm. The champion praises the dashboard UI and requests a custom reporting feature to be delivered for Q3.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // ~6 months ago
  },
  {
    payload: "Email: Acme follows up asking about the status of the custom reporting feature. Team replies it has been pushed to next quarter.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // ~4 months ago
  },
  {
    payload: "Support Ticket #1042: Minor bug reported in the analytics dashboard. Resolved in 2 days. Customer thanked support.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // ~3 months ago
  },
  {
    payload: "Support Ticket #1150: Same analytics dashboard area, different bug. Takes 5 days to resolve. Customer notes frustration in the ticket regarding repeated issues in the same area.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // ~2 months ago
  },
  {
    payload: "QBR Meeting Transcript: Acme's champion mentions the team is 'frustrated with reliability' and asks for a firm roadmap update on the delayed reporting feature.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000) // ~6 weeks ago
  },
  {
    payload: "Email: Acme casually mentions they're 'taking a look at a couple of other options in the market' while discussing renewal timing and budget allocation.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // ~3 weeks ago
  },
  {
    payload: "Support Ticket #1289: URGENT - Platform crashed during a live customer demo Acme was running for their own client. Cannot access dashboards at all.",
    tenantId: "demo-tenant-123",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // ~5 days ago
  }
];

// Combine multiple interactions to simulate a rich graph memory retrieval
export const getMockCogneeContext = (tenantId: string) => {
  if (tenantId !== "demo-tenant-123") return "No mock context found for this tenant.";
  
  // Return a combination of key events (meeting, competitor mention, recent crash) 
  // to simulate Cognee successfully retrieving historically linked events
  return JSON.stringify({
    results: [
      { text: mockInteractions[4]!.payload, relevance: 0.88 },
      { text: mockInteractions[5]!.payload, relevance: 0.95 },
      { text: mockInteractions[6]!.payload, relevance: 0.99 }
    ]
  });
};
