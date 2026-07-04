# RetainGraph — Infrastructure & Architecture Spec

Purpose of this document: a single reference a coding agent (Antigravity, Claude
Code, etc.) can be pointed at before generating code, so every generated piece
lands in the right place, talks to the right service, and respects tenant
isolation without needing this explained again per-prompt.

---

## 1. System overview

RetainGraph is a multi-tenant SaaS API + worker system + React dashboard. Its
only "hard" dependency that isn't boilerplate is Cognee: every other piece
exists to get data into Cognee cleanly and get graph-aware answers back out
fast enough for a live chat UI.

```
                       ┌─────────────────────┐
                       │   React Dashboard    │
                       │ (Vite, TS, Tailwind, │
                       │      shadcn/ui)      │
                       └──────────┬───────────┘
                                  │ HTTPS (JSON, SSE for chat streaming)
                                  ▼
                       ┌─────────────────────┐
                       │   Express API        │◄──────────────┐
                       │ retaingraph-api      │                │
                       └───┬─────────┬───────┘                │
                           │         │                         │
              enqueue job  │         │ direct read/write       │ status polling
                           ▼         ▼                         │
                   ┌───────────┐  ┌────────────┐               │
                   │  Redis    │  │  Postgres  │               │
                   │ (BullMQ)  │  │  (Prisma)  │               │
                   └─────┬─────┘  └────────────┘               │
                         │                                     │
                         ▼                                     │
              ┌────────────────────┐                           │
              │  Ingest Worker      │  add() → cognify() ──────┘
              │ retaingraph-ingest- │──────────────┐
              │      worker         │              │
              └────────────────────┘              ▼
                                          ┌──────────────────┐
              ┌────────────────────┐      │      Cognee       │
              │  Churn Scan         │─────►│ (self-hosted REST │
              │ (timer-triggered    │      │  or Cognee Cloud) │
              │  oneshot)           │◄─────│  add/cognify/     │
              └─────────┬──────────┘      │  search per-tenant │
                        │                  │  dataset            │
                        │                  └──────────┬─────────┘
                        ▼                             │
              Slack webhook (simulated)                │ context
                                                        ▼
                                              ┌───────────────┐
                                              │     Groq       │
                                              │ (LLM inference)│
                                              └───────────────┘
```

---

## 2. Components

### 2.1 Express API (`retaingraph-api`)
- Strictly typed Node.js + Express + Prisma.
- Owns all HTTP surface: ingestion intake, chat, dashboard reads, brief
  generation.
- **Never calls Cognee's `cognify()` synchronously from a request handler.**
  Ingestion writes a row + enqueues a BullMQ job and returns immediately.
- Chat and brief endpoints *do* call Cognee `search()` and Groq synchronously,
  since those are the request itself — but both should be wrapped with a
  timeout + retry/backoff (see §7).

### 2.2 Ingest Worker (`retaingraph-ingest-worker`)
- Separate long-running Node process, consumes the BullMQ `ingest` queue.
- Per job: `add()` → `cognify()` → poll `/api/v1/datasets/status` → update
  `ClientInteraction.status`.
- Concurrency controlled via `WORKER_CONCURRENCY` (default 4) — keep this low;
  cognify is the expensive step and Cognee/Groq rate limits are shared across
  all tenants.

### 2.3 Churn Scan (`retaingraph-churn`, timer-triggered)
- A **oneshot** job, not a long-running cron loop inside a service (see the
  systemd bundle's README for why). Triggered every 15 min by
  `retaingraph-churn.timer` in production; can be triggered on-demand.
- Per run: fetch `ready` interactions from the lookback window → Cognee search
  for historical context → Groq classification → write `InsightEvent` on a
  positive result → simulated Slack webhook.

### 2.4 Cognee
- Either a self-hosted REST server (`docker run` or a `cognee-server.service`
  systemd unit alongside the others) or Cognee Cloud. For a hackathon, Cognee
  Cloud is the lower-risk choice — one less thing to keep alive during the demo.
- **Dataset-per-tenant isolation**: use the Tenant's UUID as the Cognee dataset
  name on every `add`/`cognify`/`search` call. Never mix tenants in one
  dataset.
- Use the official `@cognee/cognee-ts` client rather than hand-rolled `fetch`
  calls against the REST endpoints.
- `search_type` is chosen per use case, not defaulted:
  | Use case | search_type |
  |---|---|
  | Chat narrative answer | `GRAPH_COMPLETION` |
  | Exact source citations (mapped back to `ClientInteraction.id`) | `CHUNKS_LEXICAL` or `SIMILARITY` |
  | Pre-Call Brief | `GRAPH_SUMMARY_COMPLETION` |
  | RAG-vs-graph comparison demo | run both `SIMILARITY` and `GRAPH_COMPLETION`, show both |

### 2.5 Groq
- Two call sites: chat completion (streaming, user-facing) and churn
  classification (non-streaming, worker-facing, forced JSON output).
- Keep the churn-classification system prompt strict: "Output JSON only:
  `{churn_risk: boolean, reason: string}`" — no prose, no markdown fences.

### 2.6 Postgres (Prisma)
- Single database, tenant isolation enforced at the query layer (every query
  filters by `tenantId`; there is no row-level security in the hackathon
  build — see §8 for the production caveat).

### 2.7 Redis
- Backs BullMQ for the ingest queue only. Not used for caching in v1 (see §9
  for a suggested addition if time allows).

### 2.8 React Dashboard
- Vite + TypeScript + Tailwind + shadcn/ui, talks to the API over HTTPS.
- Chat panel consumes a streamed response (SSE or chunked fetch) from
  `POST /api/chat`.

---

## 3. Data model (Prisma)

```prisma
model Tenant {
  id               String   @id @default(uuid())
  name             String
  billingTier      String   @default("demo")
  requiresAttention Boolean @default(false) // convenience flag, derived from open InsightEvents
  createdAt        DateTime @default(now())
  users            User[]
  interactions     ClientInteraction[]
  insightEvents    InsightEvent[]
}

model User {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  name      String
  email     String   @unique
  role      String   @default("csm")
  createdAt DateTime @default(now())
}

model ClientInteraction {
  id            String   @id @default(uuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  source        String   // "email" | "transcript" | "ticket"
  rawText       String
  status        String   @default("pending") // pending | cognifying | ready | failed
  cogneeDatasetId String?
  occurredAt    DateTime // when the interaction actually happened (for graph timeline)
  createdAt     DateTime @default(now())
  insightEvents InsightEvent[]

  @@index([tenantId, status])
  @@index([tenantId, occurredAt])
}

model InsightEvent {
  id                  String   @id @default(uuid())
  tenantId            String
  tenant              Tenant   @relation(fields: [tenantId], references: [id])
  triggerInteractionId String
  triggerInteraction  ClientInteraction @relation(fields: [triggerInteractionId], references: [id])
  reason              String
  resolved            Boolean  @default(false)
  createdAt           DateTime @default(now())

  @@index([tenantId, resolved])
}
```

---

## 4. Key sequence flows

### 4.1 Ingestion
```
Client → POST /api/interactions/ingest
API    → validate payload → Prisma.create(status="pending") → enqueue BullMQ job → 202 response
Worker → dequeue job → cognee.add(text, dataset=tenantId)
       → cognee.cognify(dataset=tenantId)
       → poll /api/v1/datasets/status until done
       → Prisma.update(status="ready" | "failed")
```

### 4.2 Chat query
```
Client → POST /api/chat { question }
API    → cognee.search(query=question, search_type=GRAPH_COMPLETION, dataset=tenantId)
       → cognee.search(query=question, search_type=CHUNKS_LEXICAL, dataset=tenantId)  // for citations
       → map citation chunks back to ClientInteraction.id
       → build system prompt with graph context
       → groq.chat.completions.create(stream=true)
       → stream tokens + citation metadata back to client
```

### 4.3 Proactive churn scan
```
Timer  → systemctl start retaingraph-churn.service
Job    → Prisma.findMany(status="ready", occurredAt >= now - lookbackHours)
       → for each affected tenant: cognee.search(GRAPH_COMPLETION, historical context)
       → groq.chat.completions.create({ forced JSON: churn_risk, reason })
       → if churn_risk: Prisma.create(InsightEvent) + simulateSlackWebhook(reason)
```

---

## 5. Repository layout

```
retaingraph/
├── api/
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── ingest.ts
│   │   │   ├── chat.ts
│   │   │   ├── accounts.ts
│   │   │   └── briefs.ts
│   │   ├── workers/
│   │   │   ├── ingestWorker.ts
│   │   │   └── churnScan.ts
│   │   ├── services/
│   │   │   ├── cognee.ts        # thin wrapper around @cognee/cognee-ts
│   │   │   ├── groq.ts
│   │   │   └── slack.ts         # simulated webhook
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── queue.ts         # BullMQ setup
│   │   │   └── logger.ts        # correlation-id-aware logger
│   │   └── middleware/
│   │       └── tenant.ts        # resolves + enforces tenant scoping
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/api.ts
│   └── package.json
└── deploy/
    ├── systemd/                 # unit files, env template, install README
    └── ARCHITECTURE.md          # this file
```

---

## 6. Environment variables

See `deploy/systemd/retaingraph.env.example` for the authoritative list. In
short: `DATABASE_URL`, `REDIS_URL`, `COGNEE_BASE_URL`/`COGNEE_API_KEY`,
`GROQ_API_KEY`/`GROQ_MODEL`, `DEMO_TENANT_ID`/`DEMO_API_KEY`,
`SLACK_WEBHOOK_URL`, `WORKER_CONCURRENCY`, `CHURN_LOOKBACK_HOURS`.

---

## 7. Reliability conventions the agent should follow

- **Correlation IDs**: generate one per inbound request / worker job, thread it
  through every log line and every outbound Cognee/Groq call (as a header or
  log field). This is what makes a mid-demo failure debuggable in seconds.
- **Retry/backoff**: wrap all Cognee and Groq calls with a small
  exponential-backoff retry (2–3 attempts) — both are third-party APIs and
  conference wifi is unreliable.
- **Timeouts**: chat-path Cognee/Groq calls should have an explicit timeout
  (e.g. 10s) with a graceful "still thinking" fallback rather than hanging the
  SSE stream indefinitely.
- **Idempotency**: ingest worker jobs should be safe to retry — check
  `status` before re-processing a `ClientInteraction`.

---

## 8. Tenant isolation (hackathon scope vs. real scope)

- **In this build**: isolation is enforced at the application layer — every
  Prisma query filters by `tenantId`, and every Cognee call uses `tenantId` as
  the dataset name. There is a single hardcoded demo tenant + API key; no real
  auth/session system (per the roadmap's scope-discipline note — not worth the
  hours this week).
- **Called out, not built**: production would want Postgres row-level security
  and per-tenant Cognee API keys/permissions (Cognee has a permissions/ACL
  preview feature) rather than relying solely on the application layer. Flag
  this as a known limitation in the README/demo Q&A rather than silently
  omitting it.

---

## 9. Explicitly out of scope for the 7-day build

- Real billing, real auth/session management, real Slack app (webhook is
  simulated).
- Response caching layer (Redis could double as a query cache for repeated
  chat questions — worth adding only if Days 1–6 finish early).
- Horizontal scaling / multi-host deployment — single VM, single instance of
  each service is the target topology.
- Postgres row-level security / per-tenant Cognee ACLs (see §8).

---

## 10. API surface summary

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/interactions/ingest` | Accept raw text, create pending `ClientInteraction`, enqueue processing |
| `GET`  | `/api/interactions/:id` | Poll status of a single interaction |
| `POST` | `/api/chat` | Ask a question, get a streamed graph-grounded answer + citations |
| `GET`  | `/api/accounts` | List tenants/accounts with churn-risk badge |
| `GET`  | `/api/accounts/:id` | Account detail: interaction timeline + InsightEvents |
| `POST` | `/api/accounts/:id/brief` | Generate the Pre-Call Brief (GRAPH_SUMMARY_COMPLETION) |
| `GET`  | `/api/insights?resolved=false` | Portfolio-level rollup of open InsightEvents across accounts |
