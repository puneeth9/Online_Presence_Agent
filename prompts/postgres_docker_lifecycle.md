You are modifying an existing Node.js Express backend.

The project already has:

* Express server
* Postgres connection using `pg`
* SQS setup
* dotenv
* CommonJS modules

Your task is to implement **Docker-based Postgres + proper connection lifecycle management**.

This must look production-ready and interview-quality.

---

## GOAL

1. Run Postgres via Docker
2. Connect to DB when server starts
3. Gracefully close DB connections when server shuts down
4. Use connection pooling
5. Add Docker config files
6. Keep code clean and modular

---

## STEP 1: ADD DOCKER COMPOSE

Create `docker-compose.yml` at project root.

It should define a Postgres service:

* image: postgres:15
* container name: agent-postgres
* port: 5432 exposed
* environment:
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=agentdb
* volume for persistence

Also add a named volume.

---

## STEP 2: UPDATE ENV FILE

Ensure `.env` has:

DATABASE_URL=postgres://postgres:postgres@localhost:5432/agentdb

---

## STEP 3: POSTGRES CONNECTION MODULE

Edit:
src/db/index.js

Requirements:

* Use pg Pool
* Export pool
* Add connect() function
* Add close() function

Structure:

* create pool
* function connectDB()
  → test connection
  → log success
* function closeDB()
  → pool.end()
  → log closed

Export:
pool
connectDB
closeDB

---

## STEP 4: SERVER STARTUP LIFECYCLE

Modify `src/server.js`.

On server start:

1. load dotenv
2. connect to DB
3. then start Express server

On shutdown signals:

* SIGINT
* SIGTERM

Handle gracefully:

1. log shutdown
2. close DB pool
3. exit process

Example behavior:
Ctrl+C → DB pool closes cleanly.

---

## STEP 5: START SCRIPT

Update README instructions in comments:

How to start DB:
docker compose up -d

How to stop DB:
docker compose down

---

## STEP 6: OPTIONAL HEALTH CHECK

Add GET `/health` route that:

* checks DB connection
* returns status ok

---

## CODING STANDARDS

* CommonJS (require)
* async/await
* try/catch
* clear logs
* modular exports
* no inline SQL in server.js

---

## EXPECTED RESULT

Running:
docker compose up -d
npm run dev

Should:

* start Postgres container
* connect to DB
* log "DB connected"
* start server

When stopping server:
Ctrl+C

Should:

* log "Shutting down"
* close DB pool
* exit cleanly

---

## IMPORTANT

Do NOT implement:

* migrations
* ORM
* workers
* queues

Only DB lifecycle + Docker setup.

---

## AFTER IMPLEMENTING

Explain:

* how to start docker
* how to verify connection
* how shutdown works
