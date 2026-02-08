## Online Presence Agent (Backend)

### Start Postgres (Docker)

```bash
docker compose up -d
```

### Stop Postgres (Docker)

```bash
docker compose down
```

### Run the API

```bash
npm run dev
```

On startup the server will:
- connect to Postgres (logs `DB connected`)
- run database migrations (logs `Migrations completed`)
- start the HTTP server (logs `Server running on port ...`)

### Migrations

Migrations are executed automatically on startup from `src/db/migrate.js`.

To add future tables/changes, extend `runMigrations()` with additional idempotent SQL
statements (e.g. `CREATE TABLE IF NOT EXISTS ...`).

### Verify DB connectivity

- Health endpoint:

```bash
curl -s http://localhost:4000/health
```

Expected response:
- `200 {"status":"ok"}` when DB is reachable
- `503 {"status":"down"}` when DB is not reachable

### Shutdown behavior

Stopping the server (Ctrl+C / SIGINT or SIGTERM) will:
- log `Shutting down (...)`
- close the HTTP server
- close the Postgres pool (logs `DB pool closed`)
