We already have a Node.js Express backend with:

* Docker Postgres
* pg Pool connection
* connectDB() and closeDB()
* server startup lifecycle

Now extend the system to support **database migrations executed from code**.

We want tables to be created automatically when the server starts.

---

## GOAL

Implement a simple migration system that:

* Runs when server starts
* Creates tables if they don’t exist
* Keeps SQL in codebase
* Looks production-ready
* Is modular

Do NOT use ORM.
Do NOT install Prisma/Sequelize.
Use plain SQL.

---

## STEP 1: CREATE MIGRATION FILE

Create:
src/db/migrate.js

This file should export a function:
runMigrations()

Inside it:

* run SQL queries using pool
* create jobs table if not exists

SQL:

CREATE TABLE IF NOT EXISTS jobs (
id UUID PRIMARY KEY,
name TEXT NOT NULL,
status TEXT DEFAULT 'pending',
result JSONB,
created_at TIMESTAMP DEFAULT NOW()
);

Wrap in try/catch.
Log:
"Migrations completed"

---

## STEP 2: CALL MIGRATIONS ON STARTUP

In server.js:

On startup flow should be:

1. load dotenv
2. connectDB()
3. runMigrations()
4. start server

So migrations run automatically.

---

## STEP 3: CLEAN DB MODULE

Ensure src/db/index.js exports:

pool
connectDB
closeDB

---

## STEP 4: ERROR HANDLING

If migration fails:

* log error
* exit process

---

## EXPECTED BEHAVIOR

When running:

docker compose up -d
npm run dev

Server should:

* connect to DB
* create jobs table automatically
* start server

No manual SQL needed.

---

## IMPORTANT

Do NOT add:

* migration libraries
* ORM
* schema sync tools

This is a simple startup migration system.

---

## AFTER IMPLEMENTATION

Explain:

* how migrations run
* where to add future tables
