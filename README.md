# Online Presence Agent

Turn a person's name into a structured professional profile — automatically. The agent searches the web, reads the right pages, and synthesizes a clean JSON output without any manual curation.

![Demo](./assets/demo.gif)

---

## What It Does

Submit a name (and optional context). The system fans out across the web, reads the most relevant sources, and returns a structured profile with roles, companies, key links, and a confidence score — all within seconds, all async.

```json
{
  "summary": "Satya Nadella is an American business executive and the CEO of Microsoft...",
  "roles": ["CEO of Microsoft", "Chairman of Microsoft"],
  "companies": ["Microsoft", "Sun Microsystems"],
  "confidence": 0.95,
  "key_links": [
    "https://en.wikipedia.org/wiki/Satya_Nadella",
    "https://news.microsoft.com/source/exec/satya-nadella/"
  ],
  "sourcesCollected": 5
}
```

---

## Architecture

### The Agentic Loop

The core insight: instead of blindly fetching every search result, an LLM agent drives its own research process. It decides what to search, which pages are worth reading, and whether it has enough data — just like a human researcher would.

```
User submits name
      │
      ▼
API Server (Express)
  ├─ creates job row (Postgres, status=pending)
  └─ enqueues to SQS
      │
      ▼
Worker (SQS long-poll)
  └─ runProfileAgent()
        │
        ▼
  ┌─────────────────────────────────────────────────────┐
  │              Agentic Loop (up to 20 iterations)      │
  │                                                       │
  │  LLM ──tool_call──► web_search → Brave Search API   │
  │   ▲                                                   │
  │   │  tool_result                                      │
  │   │                                                   │
  │  LLM ──tool_call──► fetch_page → scrape URL          │
  │   ▲                              persist to sources   │
  │   │  tool_result                                      │
  │   │                                                   │
  │  LLM ──tool_call──► assess_completeness              │
  │   ▲                    ├─ complete=true → stop        │
  │   │                    └─ incomplete → next query     │
  │   └──────────────────────────────────────────────────┤
  │                                                       │
  │  Stop when: model stops calling tools                 │
  │           | assess_completeness returns complete=true │
  │           | max iterations reached                    │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  Synthesis: LLM produces structured JSON from all findings
        │
        ▼
  Postgres (jobs.result updated, status=completed)
        │
      ▼
React UI (polling every 5-10s) displays result
```

### Why Agentic vs. Linear

The previous version ran a fixed pipeline: search → fetch all results → extract once. That approach fetches too much irrelevant content and misses follow-up signals.

The agent loop is better because:

| | Linear Pipeline | Agentic Loop |
|---|---|---|
| **Search strategy** | One fixed query | Adaptive — refines queries based on what it finds |
| **Page selection** | Fetches all results | LLM selects only the most promising URLs |
| **Completeness check** | Never — runs once | Built-in: `assess_completeness` tool gates synthesis |
| **Follow-up searches** | None | Issues targeted follow-ups for missing fields |
| **Resource usage** | Fixed cost per job | Efficient — stops as soon as data is sufficient |

### Tools Available to the Agent

| Tool | What it does |
|------|-------------|
| `web_search` | Queries Brave Search, returns top 5 results with title, URL, snippet |
| `fetch_page` | Fetches and extracts text from a URL; persists it to the `sources` table |
| `assess_completeness` | LLM self-evaluation — returns `complete`, `missing_fields`, `suggested_next_query` |

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TypeScript, React Router |
| Backend | Node.js, Express 5, CommonJS |
| Agent | OpenAI function calling (`gpt-4o-mini` by default) |
| Search | Brave Search API |
| Queue | AWS SQS |
| Storage | PostgreSQL 15, `pg` pool |
| Infra | Docker Compose (local Postgres) |

---

## Codebase Layout

```
.
├── client/                     # React UI (Vite + TypeScript)
│   └── src/
│       ├── App.tsx             # Routes: /, /requests, /requests/:id
│       └── api/ApiClient.ts    # Fetch wrapper, reads VITE_API_URL
│
├── server/
│   └── src/
│       ├── agent/
│       │   ├── profileAgent.js # Agentic loop — main entry point for job processing
│       │   └── tools.js        # Tool schemas + implementations (web_search, fetch_page, assess_completeness)
│       ├── worker/
│       │   ├── worker.js       # SQS long-poll loop
│       │   ├── processJob.js   # Job orchestrator — calls runProfileAgent()
│       │   ├── llm.service.js  # callLLM() + callLLMWithTools() (OpenAI, ESM-compat)
│       │   ├── search.service.js
│       │   ├── fetch.service.js
│       │   ├── extract.service.js
│       │   └── linearPipeline.js  # Original fixed pipeline (preserved for reference)
│       ├── controllers/
│       ├── routes/
│       ├── db/                 # pg pool + auto-migrations
│       └── server.js
│
└── prompts/                    # Prompt iteration scratch files
```

### API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Create job, enqueue to SQS |
| `GET` | `/analyze` | List all jobs |
| `GET` | `/analyze/:id` | Get job status |
| `GET` | `/analyze/result/:id` | Get completed job result + sources |

### Database Schema

```sql
jobs    (id UUID, name TEXT, description TEXT, status TEXT, result JSONB, created_at TIMESTAMP)
sources (id SERIAL, job_id UUID → jobs, url TEXT, title TEXT, snippet TEXT, content TEXT, created_at TIMESTAMP)
```

Status flow: `pending` → `processing` → `completed` | `failed`

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker Desktop (for Postgres)
- API keys: Brave Search, OpenAI, AWS (SQS)

### Clone and install

```bash
git clone <your-repo-url>
cd online-presence-agent
```

### Start Postgres

```bash
cd server
docker compose up -d
```

### Start the API server

```bash
cd server
npm install
npm run dev
```

### Start the worker (separate terminal)

```bash
cd server
npm run dev:worker
```

### Start the frontend

```bash
cd client
npm install
npm run dev
```

### Environment variables

**`server/.env`**

```bash
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/agentdb

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=

BRAVE_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini   # optional — override to gpt-4o for higher accuracy
```

**`client/.env`**

```bash
VITE_API_URL=http://localhost:4000
```

---

## Design Decisions

**Agentic loop over fixed pipeline** — the agent's ability to issue follow-up searches and self-assess completeness produces higher-quality profiles on ambiguous or sparse targets, at lower average cost than fetching everything blindly.

**OpenAI function calling for tool dispatch** — using the native `tool_calls` API keeps the loop clean: the model returns structured tool invocations, the host executes them, and results feed back into the conversation. No prompt hacking required.

**SQS + dedicated worker** — decouples the API from long-running agent work. The API stays fast, the worker scales independently, and failures in one don't affect the other.

**Polling over WebSockets** — simpler to operate and debug for async jobs with variable completion times. Polling interval is adaptive: 5s while active, 10s on the list view.

**ESM workaround for OpenAI SDK** — the server is CommonJS; the OpenAI SDK is ESM-first. A dynamic `import()` inside `llm.service.js` resolves the interop cleanly without converting the whole server.

**Code-based migrations** — schema is applied on startup via `db/migrate.js`. No ORM, no migration runner needed in dev.

---

## What's Next

- **Streaming progress** — SSE to push agent iteration updates to the UI in real time
- **Richer tool set** — LinkedIn scraper, GitHub profile reader, news aggregator as additional agent tools
- **DLQ + retry policy** — SQS dead-letter queue with exponential backoff for poison messages
- **Confidence thresholds** — automatically trigger deeper research passes when confidence < 0.7
- **Multi-target batch jobs** — enrich a list of contacts in a single request

---

## Author

Built by Puneeth — backend-focused full-stack engineer working on AI agents and scalable async systems.

- GitHub: [github.com/puneeth9](https://github.com/puneeth9)
- LinkedIn: [linkedin.com/in/puneeth-sai-tumbalabeedu](https://www.linkedin.com/in/puneeth-sai-tumbalabeedu/)
