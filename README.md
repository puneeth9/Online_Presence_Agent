### Online Presence Agent

An async pipeline that turns a person’s public web footprint into a structured profile.

- **Search → fetch → extract**: Brave Search + page fetching + LLM extraction
- **Async by design**: API creates jobs, worker processes in the background, UI polls
- **Full‑stack**: React (Vite) client + Node/Express server + Postgres + SQS

![Demo](./assets/demo.gif)

---

### Why This Project Matters

People’s “online presence” is scattered across profiles, articles, and social posts. This project turns that noisy, multi‑source data into a **single structured output** that’s easy to consume programmatically.

For engineers, it’s an end‑to‑end example of a **production‑minded async system**: queue-backed job processing, resilient ingestion, and a polling UI that stays responsive while work runs in the background.

---

### Features

- **Name search → presence aggregation** via Brave Search API
- **Page fetching pipeline** with HTML-to-text extraction and length limits
- **LLM summarization/extraction** into a structured JSON profile
- **Async job processing** with SQS + a dedicated worker process
- **Polling system** in the UI (requests list + job detail)
- **Modular architecture** (search/fetch/extract services, DB lifecycle, migrations)

---

### Architecture Overview

The system uses an async job flow so the UI stays fast while the backend performs network-heavy work (search + page fetch + LLM calls).

**High-level flow**

```
React Client
  │  POST /analyze
  ▼
API Server (Express)
  │  insert jobs row (Postgres)
  │  send message (SQS)
  ▼
Worker (SQS long polling)
  │  set status=processing
  │  Brave Search → top results
  │  Fetch pages → store sources
  │  LLM extract → store profile JSON
  ▼
Postgres (jobs + sources)

React Client polling
  │  GET /analyze/:id, GET /analyze/result/:id
  ▼
API Server (Express)
  │  query jobs/sources (Postgres)
  ▼
React Client
```

**Polling**
- Requests list refreshes every **10s**
- Job detail polls status every **30s** while pending/processing

---

### Tech Stack Table

| Layer | Tech |
|------|------|
| Frontend | React (Vite), React Router, TypeScript |
| Backend | Node.js, Express (CommonJS) |
| AI | OpenAI (SDK) |
| Search | Brave Search API |
| Queue | AWS SQS |
| Storage | Postgres (Docker), `pg` Pool |

---

### Folder Structure

```
.
├── client/                 # React UI (Vite)
├── server/                 # API + worker + DB/migrations + docker-compose
├── prompts/                # Build prompts used during development
├── assets/                 # demo.gif
└── README.md
```

---

### Installation (SUPER IMPORTANT)

#### Prerequisites
- Node.js **>= 18**
- npm
- Docker Desktop (for Postgres)
- API keys:
  - Brave Search API key
  - OpenAI API key
  - AWS credentials for SQS

#### Setup

```bash
git clone <your-repo-url>
cd online-presence-agent
```

#### Backend (API + Postgres)

```bash
cd server
npm install
docker compose up -d
npm run dev
```

#### Worker

Open a second terminal:

```bash
cd server
npm run worker
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### Environment variables

**Server** (`server/.env`)

```bash
PORT=4000

DATABASE_URL=postgres://postgres:postgres@localhost:5432/agentdb

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=

BRAVE_API_KEY=

OPENAI_API_KEY=
```

**Client** (`client/.env`)

```bash
VITE_API_URL=http://localhost:4000
```

---

### How It Works (Flow)

1. User submits **name + optional description** from the React UI
2. API creates a **job row** in Postgres (`status=pending`)
3. API publishes a message to **SQS** with `{ jobId, name }`
4. Worker long-polls SQS, marks job **processing**
5. Worker searches Brave, fetches pages, and stores rows in `sources`
6. Worker calls the LLM to extract a structured profile JSON
7. Worker stores the JSON into `jobs.result`, marks job **completed**
8. Client polls job status/result and updates the UI automatically

---

### Example Output

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

### Design Decisions

- **Async pipeline (API + queue + worker)**: avoids long request latency; isolates failures; scales background work independently.
- **Polling instead of websockets**: simplest reliable UX for async jobs; easy to operate and debug.
- **Modular worker services**: clear separation of concerns (search vs fetch vs extract); easier to test/extend.
- **Code-based migrations**: deterministic startup behavior for local/dev environments without ORM tooling.

---

### Future Improvements

- Server-sent events (SSE) or websockets for real-time updates
- Better HTML extraction (boilerplate removal, language detection)
- Rate limiting + exponential backoff for external APIs
- SQS DLQ (dead-letter queue) + poison message handling policies
- Pagination + filtering for job history; richer observability/logging

---

### Author Section

Built by Puneeth  
Backend-focused full-stack engineer  
Interested in AI agents & scalable systems  

GitHub: https://github.com/puneeth9

LinkedIn: https://www.linkedin.com/in/puneeth-sai-tumbalabeedu/
