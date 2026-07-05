# RetainGraph Backend Testing & Workflows Guide

This guide details the end-to-end workflows, API payloads, validation checkpoints, and local commands to test the RetainGraph AI-native Customer Success Intelligence backend.

---

## 1. Local Testing Scripts

Before running HTTP requests, you can execute the pre-configured TypeScript test scenarios to verify prompt parsing, risk reasoning, and database isolation.

### Pipeline E2E Script
Simulates database cleanup, customer interaction ingestion, knowledge graph traversal, risk auditing, chat copilot citations, alert dismissal delta scoring, and procedural memory verification.
```bash
# From the api/ directory
npx ts-node src/scripts/testPipeline.ts
```

### Pre-Call Brief Scenarios Script
Tests 5 distinct prompt cases (healthy account, critical churn indicators, conflicting procedural memory, sparse context) verifying schema safety, output consistency, and evidence tracing.
```bash
# From the api/ directory
npx ts-node src/scripts/testBriefScenarios.ts
```

---

## 2. API Workflow Specifications

### Workflow A: Customer Anomaly Ingestion & Audit
Flow: Ingest raw conversation signals -> Trigger health scan -> Query updated health status.

#### 1. Ingest Raw Interaction
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/ingest`
*   **Input Headers**: `Content-Type: application/json`
*   **Request JSON Payload**:
    ```json
    {
      "tenantId": "demo-tenant-123",
      "payload": "objection: We are looking closely at Salesforce because the system keeps crashing on the dashboard load and customer support takes 48 hours to answer."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "interactionId": "c7b3e210-91a5-4f40-8b1e-cc720a4b92c4"
    }
    ```

#### 2. Trigger Health Scan
Calculates the risk score based on the new logs and links graph entities.
*   **Method**: `GET`
*   **Endpoint**: `/api/v1/accounts/demo-tenant-123/health`
*   **Response (200 OK)**:
    ```json
    {
      "riskScore": 70,
      "confidence": "high",
      "recommendedAction": "Schedule immediate engineering sync to resolve dashboard crashing issues.",
      "healthTrend": "declining",
      "lastEvaluation": "2026-07-05T01:30:00.000Z",
      "rootCauses": [
        {
          "category": "Engineering",
          "contribution": 40,
          "evidence": "Dashboard crashing on load"
        },
        {
          "category": "Support",
          "contribution": 30,
          "evidence": "48 hour responsiveness delay"
        }
      ]
    }
    ```

---

### Workflow B: Grounded AI Copilot Chat (RAG)
Flow: Query client context -> Fetch answers with actual graph linkages and support citations.

*   **Method**: `POST`
*   **Endpoint**: `/api/v1/chat`
*   **Input Headers**: `Content-Type: application/json`
*   **Request JSON Payload**:
    ```json
    {
      "question": "Why is demo-tenant-123 marked as high risk and what competitors are they looking at?"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "answer": "demo-tenant-123 is marked as high risk due to repeated system crashes on dashboard load and support delays. They are currently evaluating Salesforce as a competitor alternative.",
      "citations": [
        {
          "source": "Support Log",
          "excerpt": "Evaluating Salesforce because system keeps crashing"
        }
      ],
      "graphEntities": ["Salesforce", "Dashboard", "API Engine"]
    }
    ```

---

### Workflow C: Seeding CSM Procedural Memory
Flow: Dismiss active warning alert -> Log correction reason -> Re-audit to verify risk score delta.

#### 1. Dismiss Alert
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/health/{healthRecordId}/correct`
*   **URL Parameter**: `healthRecordId` (Retrieve this UUID from the timeline endpoint or the dashboard overview recommendations feed).
*   **Request JSON Payload**:
    ```json
    {
      "correctionReason": "Salesforce evaluation is a competitor benchmarking query, not a procurement cycle. Verified dashboard stability patches are live."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "record": {
        "id": "health-uuid-here",
        "status": "dismissed",
        "correctionReason": "Salesforce evaluation is a competitor benchmarking query...",
        "resetAt": "2026-07-05T01:31:00.000Z"
      }
    }
    ```

#### 2. Re-trigger Audit Scan
Run the audit again to check memory override influence:
```bash
curl http://localhost:3000/api/v1/accounts/demo-tenant-123/health
```
*(Observe risk score reduces from `70` to `65` due to the CSM override rules!)*

---

### Workflow D: Compile Pre-Call Meeting Briefs
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/accounts/demo-tenant-123/brief`
*   **Response (200 OK)**:
    ```json
    {
      "customerName": "Acme Corp",
      "riskScore": 65,
      "briefConfidence": 0.85,
      "keyStakeholders": ["Johnathan Wick", "Helen Cho"],
      "recommendedTalkingPoints": [
        "Acknowledge past dashboard instability and confirm resolution",
        "Address Salesforce benchmark comparison and highlight graph indexing advantages"
      ],
      "nextActions": [
        "Schedule technical alignment check-in with Helen Cho"
      ]
    }
    ```

---

## 3. Quick curl Test Commands Copy-Paste Sheet

```bash
# Ingest raw objection signal
curl -X POST http://localhost:3000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "demo-tenant-123", "payload": "objection: API timeout delays"}'

# Trigger risk audit pass
curl http://localhost:3000/api/v1/accounts/demo-tenant-123/health

# Fetch audit timelines and record IDs
curl http://localhost:3000/api/v1/accounts/demo-tenant-123/health/timeline

# Ask AI Copilot (RAG)
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Summarize outstanding customer problems"}'

# Generate pre-call brief
curl -X POST http://localhost:3000/api/v1/accounts/demo-tenant-123/brief
```
