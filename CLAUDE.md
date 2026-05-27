# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Online Presence Agent** — an async pipeline that takes a person's name and description, searches the web via Brave Search, fetches page content, and uses an LLM (OpenAI) to extract a structured profile JSON. Jobs are queued via AWS SQS, persisted in PostgreSQL, and the React frontend polls for results.

## Repository Layout

```
client/    # React 19 + Vite + TypeScript frontend
server/    # Node.js + Express 5 backend (CommonJS)
prompts/   # Prompt development scratch files
```

## Development Commands

### Client (React + Vite)
```bash
cd client
npm run dev        # Vite dev server (HMR)
npm run build      # tsc + vite build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

### Server (Express API)
```bash
cd server
npm run dev        # Nodemon hot-reload server
npm run start      # Production server
npm run dev:worker # Nodemon hot-reload SQS worker
npm run worker     # Production SQS worker
```

### Infrastructure
```bash
cd server
docker-compose up -d    # Start PostgreSQL 15 on port 5432
```

Database migrations run automatically on server startup (`db/migrate.js`).

## Architecture

### Async Job Pipeline

```
Client (React) → POST /analyze → Express API → SQS queue
                                                    ↓
                                               SQS Worker
                                                    ↓
                                    search.service → Brave Search API
                                    fetch.service  → scrape URLs
                                    extract.service → LLM prompt
                                    llm.service    → OpenAI gpt-4o-mini
                                                    ↓
                                               PostgreSQL (jobs + sources tables)
                                                    ↑
Client (polling every 5-10s) → GET /analyze/:id ──┘
```

### Backend Entry Points
- `server/src/server.js` — Express app init, DB connection, runs migrations on startup
- `server/src/app.js` — CORS/JSON middleware, mounts routes
- `server/src/worker/worker.js` — SQS long-poll loop (10s wait, 1 message at a time)
- `server/src/worker/processJob.js` — Orchestrates the full job pipeline

### API Routes
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/analyze` | Create job, enqueue to SQS |
| GET | `/analyze` | List all jobs |
| GET | `/analyze/:id` | Get job status |
| GET | `/analyze/result/:id` | Get completed job result |

### Frontend Entry Points
- `client/src/main.tsx` — React root with Router
- `client/src/App.tsx` — Route definitions (`/`, `/requests`, `/requests/:id`)
- `client/src/api/ApiClient.ts` — Singleton fetch wrapper; reads `VITE_API_URL` (default: `http://localhost:4000`)

### Database Schema (auto-migrated)
```sql
jobs    (id UUID, name, description, status, result JSONB, created_at)
sources (id SERIAL, job_id UUID→jobs, url, title, snippet, content, created_at)
```
Job `status` values: `pending` → `processing` → `completed` | `failed`

### OpenAI Integration Note
`llm.service.js` uses a dynamic `import()` of the OpenAI SDK as an ESM workaround inside a CommonJS server — preserve this pattern if updating the LLM layer.

## Environment Variables

**Server** (`.env` in `server/`):
```
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/agentdb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=
BRAVE_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini   # optional override
```

**Client** (`.env` in `client/`):
```
VITE_API_URL=http://localhost:4000
```

## Expected Output Schema
```json
{
  "summary": "string",
  "roles": ["string"],
  "companies": ["string"],
  "confidence": 0.0,
  "key_links": ["string"],
  "sourcesCollected": 0
}
```
