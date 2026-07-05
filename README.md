# RetainGraph 🧠📈

**A Zero-Latency Proactive Intelligence Engine built on Cognee.**

RetainGraph is a multi-tenant SaaS platform that eliminates customer churn by giving Customer Success Managers an AI co-pilot with flawless, long-term memory. It ingests client interactions (emails, transcripts, tickets) and builds a persistent, evolving knowledge graph per account using **Cognee Cloud**.

## 🏗 Architecture

```mermaid
graph TD
    %% Core Systems
    subgraph Data Layer
        DB[(Prisma SQLite)]
        Cognee[(Cognee Cloud)]
    end

    subgraph Backend [Express Node.js Server]
        IngestAPI[POST /api/interactions/ingest]
        ChatAPI[POST /api/chat]
        CronWorker((Proactive Intelligence Worker))
    end

    subgraph Frontend [React Vite Dashboard]
        Dashboard[Account List & Timeline]
        Comparison[Graph vs Vector Comparison View]
    end

    %% Flow: Ingestion
    Client[Webhook / Client] -->|Push interaction| IngestAPI
    IngestAPI -->|Save Raw Data| DB
    IngestAPI -->|Stream unstructured data| Cognee

    %% Flow: Proactive Worker
    CronWorker -->|Every 1 minute| DB
    CronWorker -->|Context Fetch| Cognee
    Cognee -.->|Graph-Aware Summary| CronWorker
    CronWorker -->|Prompt + JSON Mode| LLM((Groq / openai/gpt-oss-20b))
    LLM -.->|Risk Score & Root Causes| CronWorker
    CronWorker -->|Write Alert| DB

    %% Flow: Chat Engine & Compare
    Dashboard -->|Reads data| DB
    Comparison -->|Naive Query| DB
    Comparison -->|Graph Query| ChatAPI
    ChatAPI -->|Fetch Context| Cognee
    ChatAPI -->|Stream Generation| LLM
```

## 🚀 Features

1. **Autonomous Health Evaluations:** A background worker constantly evaluates new interaction deltas using `openai/gpt-oss-20b` JSON mode.
2. **Cognee Knowledge Graphs:** Maps client histories to find complex dependencies (e.g. Delayed feature -> Rising tickets -> Competitor mention).
3. **Compare Engine:** A live, side-by-side split screen comparing a naive single-document vector lookup against the robust Cognee graph traversal.
4. **Zero Latency:** Leverages Groq's LPU architecture for incredibly fast streaming responses.

## 🛠 Tech Stack

- **Backend:** Node.js, Express, Prisma (SQLite)
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **AI/Graph Memory:** Cognee Cloud REST API
- **LLM Engine:** Groq (`openai/gpt-oss-20b`)

## 🏃 Running Locally

**Prerequisites:** Node 20+, `COGNEE_API_URL`, `COGNEE_API_KEY`, `GROQ_API_KEY`

1. **Setup & Seed Backend Database**
   ```bash
   cd api
   npm install
   npx prisma db push
   npx prisma db seed
   ```
2. **Start Backend**
   ```bash
   npm run dev
   ```
3. **Start Frontend**
   ```bash
   cd ../web
   npm install
   npm run dev
   ```

*Note: The platform ships with a `COGNEE_MOCK_MODE=true` toggle allowing full UI testing with dummy graph data before connecting the live Cognee environment.*

---

## 🚀 Deployment Guide

### 1. Backend (Render)
You can deploy the backend using the included `render.yaml` Blueprint or manually:

#### Manual Setup:
1. Create a **Web Service** on Render connected to this repository.
2. Configure the following parameters:
   - **Root Directory:** `api`
   - **Build Command:** `npm install && npm run build && npx prisma generate`
   - **Start Command:** `node dist/server.js`
3. Add the following Environment Variables in the Render settings:
   - `DATABASE_URL`: `file:./dev.db`
   - `COGNEE_API_URL`: Your Cognee URL
   - `COGNEE_API_KEY`: Your Cognee API Key
   - `COGNEE_MOCK_MODE`: `false` (or `true` if testing offline)
   - `GROQ_API_KEY`: Your Groq API Key
   - `GROQ_MODEL`: `llama-3.3-70b-versatile`

### 2. Frontend (Vercel)
1. Create a project on Vercel connected to this repository.
2. In the project settings, configure:
   - **Root Directory:** `web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the following environment variable to connect the frontend to the deployed backend:
   - `VITE_API_BASE`: `https://<your-render-backend-url>/api/v1`
4. Deploy the project. Vercel will build and serve the app as a standard Vite SPA/SSR static page.
