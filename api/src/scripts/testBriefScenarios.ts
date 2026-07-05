import dotenv from 'dotenv';
dotenv.config();
import { getBriefPrompt } from '../ai/prompts/BriefPrompt';
import { reasoningService } from '../ai/services/ReasoningService';

const SCENARIOS = [
  {
    name: "Scenario 1: Healthy Account",
    riskScore: 5,
    confidence: "high",
    recommendation: "No action needed; continue monitoring.",
    rootCauses: "[]",
    graphContext: JSON.stringify({
      summary: { totalNodes: 2, totalEdges: 0 },
      nodes: [
        { id: "1", label: "Acme", type: "Customer" },
        { id: "2", label: "Analytics Dashboard", type: "Component" }
      ],
      edges: []
    }),
    proceduralMemory: "",
    recentInteractions: "- [2026-06-29T21:37:05.343Z] Support Ticket #1289: API issue solved and verified by engineering.\n- [2026-07-04T12:00:00.000Z] Email: Customer thanked the team and marked everything as resolved."
  },
  {
    name: "Scenario 2: High-Risk Account",
    riskScore: 85,
    confidence: "high",
    recommendation: "Escalate API reliability and schedule senior leadership call.",
    rootCauses: "[{\"cause\":\"API Instability\",\"evidence\":\"Ticket #1289\"}]",
    graphContext: JSON.stringify({
      summary: { totalNodes: 3, totalEdges: 1 },
      nodes: [
        { id: "1", label: "Acme", type: "Customer" },
        { id: "2", label: "Johnathan Wick", type: "CTO" },
        { id: "3", label: "Salesforce", type: "Competitor" }
      ],
      edges: [
        { source: "Acme", target: "Salesforce", relation: "evaluating" }
      ]
    }),
    proceduralMemory: "",
    recentInteractions: "- [2026-06-29T21:37:05.343Z] Support Ticket #1289: URGENT - Platform crashed during a live customer demo.\n- [2026-07-04T10:00:00.000Z] Email: Champion mentions they are taking a look at Salesforce due to ongoing API issues."
  },
  {
    name: "Scenario 3: Conflicting Procedural Memory",
    riskScore: 15,
    confidence: "high",
    recommendation: "Maintain standard QBR cycle.",
    rootCauses: "[]",
    graphContext: JSON.stringify({
      summary: { totalNodes: 3, totalEdges: 0 },
      nodes: [
        { id: "1", label: "Acme", type: "Customer" },
        { id: "2", label: "Salesforce", type: "Competitor" },
        { id: "3", label: "Helen Cho", type: "Sponsor" }
      ],
      edges: []
    }),
    proceduralMemory: "- [2026-07-04T22:00:00.000Z] Correction: CSM verified that the Salesforce evaluation was a standard competitor intelligence benchmark check, not an active procurement cycle.",
    recentInteractions: "- [2026-07-04T10:00:00.000Z] Email: Acme mentions they are evaluating Salesforce."
  },
  {
    name: "Scenario 4: Sparse Context",
    riskScore: 50,
    confidence: "low",
    recommendation: "Review account history.",
    rootCauses: "[]",
    graphContext: JSON.stringify({
      summary: { totalNodes: 0, totalEdges: 0 },
      nodes: [],
      edges: []
    }),
    proceduralMemory: "",
    recentInteractions: ""
  },
  {
    name: "Scenario 5: Conflicting Health Engine",
    riskScore: 90,
    confidence: "high",
    recommendation: "Immediate executive escalation.",
    rootCauses: "[{\"cause\":\"Critical Risk Alert\",\"evidence\":\"API issues\"}]",
    graphContext: JSON.stringify({
      summary: { totalNodes: 2, totalEdges: 0 },
      nodes: [
        { id: "1", label: "Acme", type: "Customer" }
      ],
      edges: []
    }),
    proceduralMemory: "",
    recentInteractions: "- [2026-07-04T12:00:00.000Z] Email: Customer says they love the platform and everything is working perfectly."
  }
];

function validateSchema(parsed: any): boolean {
  try {
    if (typeof parsed.executiveSummary !== 'string') return false;
    if (!parsed.customerHealth || typeof parsed.customerHealth.riskScore !== 'number' || typeof parsed.customerHealth.confidence !== 'string' || typeof parsed.customerHealth.recommendation !== 'string' || typeof parsed.customerHealth.summary !== 'string') return false;
    if (!Array.isArray(parsed.openRisks)) return false;
    for (const r of parsed.openRisks) {
      if (typeof r.risk !== 'string' || typeof r.severity !== 'string' || typeof r.status !== 'string' || typeof r.confidence !== 'number' || typeof r.owner !== 'string') return false;
      if (!Array.isArray(r.evidence)) return false;
      for (const ev of r.evidence) {
        if (typeof ev.source !== 'string' || (ev.timestamp !== null && typeof ev.timestamp !== 'string') || typeof ev.excerpt !== 'string') return false;
      }
    }
    if (!Array.isArray(parsed.keyStakeholders)) return false;
    if (!parsed.sentimentTrend || typeof parsed.sentimentTrend.trend !== 'string' || !Array.isArray(parsed.sentimentTrend.history)) return false;
    for (const h of parsed.sentimentTrend.history) {
      if ((h.date !== null && typeof h.date !== 'string') || typeof h.sentiment !== 'string' || (h.source !== null && typeof h.source !== 'string')) return false;
    }
    if (!Array.isArray(parsed.commitments)) return false;
    if (!Array.isArray(parsed.recommendedTalkingPoints)) return false;
    if (!Array.isArray(parsed.nextActions)) return false;
    if (!Array.isArray(parsed.reasoningSummary)) return false;
    if (typeof parsed.briefConfidence !== 'number') return false;
    return true;
  } catch (e) {
    return false;
  }
}

async function runTests() {
  console.log("=== STARTING RIGOROUS SCENARIO VERIFICATION SUITE ===");

  const confidences: number[] = [];
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const s of SCENARIOS) {
    console.log(`[INFO] Sleeping 8s to respect Groq organization TPM rate limits...`);
    await sleep(8000);
    const promptBuildStart = Date.now();
    const prompt = getBriefPrompt(
      s.graphContext,
      s.riskScore,
      s.confidence,
      s.recommendation,
      s.rootCauses,
      s.proceduralMemory,
      s.recentInteractions
    );
    const promptBuildMs = Date.now() - promptBuildStart;

    const promptSize = prompt.length;
    
    const groqStart = Date.now();
    const response = await reasoningService.getJsonResponse(prompt);
    const groqApiMs = Date.now() - groqStart;

    const parseStart = Date.now();
    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      console.log(`[FAIL] ${s.name} - Invalid JSON response format returned by Groq`);
      continue;
    }
    const jsonParseMs = Date.now() - parseStart;
    const totalDurationMs = Date.now() - promptBuildStart;

    console.log(`\n==========================================`);
    console.log(`TEST RUN: ${s.name}`);
    console.log(`------------------------------------------`);
    console.log(`[METRICS] Prompt Size: ${promptSize} chars`);
    console.log(`[METRICS] Output Size: ${response.length} chars`);
    console.log(`[METRICS] Prompt Build Time: ${promptBuildMs} ms`);
    console.log(`[METRICS] Groq API Time: ${groqApiMs} ms`);
    console.log(`[METRICS] JSON Parse Time: ${jsonParseMs} ms`);
    console.log(`[METRICS] Total Duration: ${totalDurationMs} ms`);

    const inputTokens = Math.round(promptSize / 4);
    const outputTokens = Math.round(response.length / 4);
    console.log(`[METRICS] LLM Tokens Input: ${inputTokens} | Output: ${outputTokens}`);

    // DTO Schema validation assertion
    const isSchemaValid = validateSchema(parsed);
    console.log(`[ASSERTION] DTO Schema Validation -> ${isSchemaValid ? "PASS" : "FAIL"}`);

    // ASSERTION 1: Authoritative Health Override
    const authScoreMatch = parsed.customerHealth.riskScore === s.riskScore;
    const authConfMatch = parsed.customerHealth.confidence === s.confidence;
    const authRecMatch = parsed.customerHealth.recommendation === s.recommendation;
    const healthOverrideResult = authScoreMatch && authConfMatch && authRecMatch;
    console.log(`[ASSERTION] Rule 1: Authoritative Health Override -> ${healthOverrideResult ? "PASS" : "FAIL"}`);

    // Scenario 5 specific rule: Risk engine override
    if (s.name === "Scenario 5: Conflicting Health Engine") {
      const summaryText = (parsed.customerHealth.summary + " " + parsed.executiveSummary).toLowerCase();
      const respectsConflict = summaryText.includes("90") || summaryText.includes("escalation") || summaryText.includes("high risk");
      console.log(`[ASSERTION] Rule 1b: Risk Engine Overrides Positive Interactions -> ${respectsConflict ? "PASS" : "FAIL"}`);
    }

    // ASSERTION 2: Procedural Memory Effect Verification
    let pmPass = true;
    if (s.name === "Scenario 3: Conflicting Procedural Memory") {
      const summaryText = (parsed.customerHealth.summary + " " + parsed.executiveSummary).toLowerCase();
      const mentionsBenchmark = summaryText.includes("benchmark") || summaryText.includes("correction") || summaryText.includes("false alarm");
      pmPass = mentionsBenchmark;
      console.log(`[ASSERTION] Rule 2: Procedural Memory Reinterpreted Complaint -> ${pmPass ? "PASS" : "FAIL"}`);
    }

    // ASSERTION 3: Stakeholders Extraction (No Hallucinated Names)
    let stakeholderPass = true;
    const inputContext = s.graphContext + " " + s.recentInteractions + " " + s.proceduralMemory + " " + s.rootCauses + " " + s.recommendation;
    for (const name of parsed.keyStakeholders) {
      if (!inputContext.includes(name) && name !== "Acme's champion") {
        stakeholderPass = false;
        console.log(`  [FAIL] Hallucinated stakeholder detected: "${name}"`);
      }
    }
    console.log(`[ASSERTION] Rule 3: Key Stakeholders Hallucination Check -> ${stakeholderPass ? "PASS" : "FAIL"}`);

    // ASSERTION 4: Open Risk Evidence Grounding & Traceability
    let evidencePass = true;
    if (parsed.openRisks.length > 0) {
      for (const r of parsed.openRisks) {
        if (!r.evidence || r.evidence.length === 0) {
          evidencePass = false;
          console.log(`  [FAIL] Risk factor "${r.risk}" has no supporting evidence array`);
        } else {
          for (const ev of r.evidence) {
            // Verify excerpt substring exists in interactions
            if (ev.excerpt && !inputContext.includes(ev.excerpt)) {
              evidencePass = false;
              console.log(`  [FAIL] Excerpt is not traceable in provided context: "${ev.excerpt}"`);
            }
            if (ev.source && !inputContext.includes(ev.source)) {
              const ticketNum = ev.source.match(/#\d+/);
              if (ticketNum && !inputContext.includes(ticketNum[0])) {
                evidencePass = false;
                console.log(`  [FAIL] Source is not traceable: "${ev.source}"`);
              }
            }
          }
        }
      }
    }
    console.log(`[ASSERTION] Rule 4: Traceable Risk Evidence Verification -> ${evidencePass ? "PASS" : "FAIL"}`);

    // ASSERTION 5: No Invented Ticket Numbers
    let ticketPass = true;
    const ticketIdsInContext = (inputContext.match(/#\d+/g) || []) as string[];
    const responseText = JSON.stringify(parsed);
    const ticketIdsInResponse = (responseText.match(/#\d+/g) || []) as string[];
    for (const tid of ticketIdsInResponse) {
      if (!ticketIdsInContext.includes(tid)) {
        ticketPass = false;
        console.log(`  [FAIL] Hallucinated ticket ID detected: "${tid}"`);
      }
    }
    console.log(`[ASSERTION] Rule 5: Ticket ID Inventions Check -> ${ticketPass ? "PASS" : "FAIL"}`);

    // Track dynamic confidence values
    if (typeof parsed.briefConfidence === 'number') {
      confidences.push(parsed.briefConfidence);
    }
  }

  // ASSERTION 6: Confidence Variance Verification
  console.log(`\n==========================================`);
  console.log(`DYNAMIC BRIEF CONFIDENCE COMPARISON`);
  console.log(`------------------------------------------`);
  console.log(`Recorded Confidence Values:`, confidences);
  const distinctConfidences = new Set(confidences);
  const confidenceVariancePass = distinctConfidences.size > 1;
  console.log(`[ASSERTION] Rule 6: Confidence Varies Dynamically -> ${confidenceVariancePass ? "PASS" : "FAIL"}`);
}

runTests().catch(console.error);
