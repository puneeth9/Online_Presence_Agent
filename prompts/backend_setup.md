# Backend Structure Setup
You are helping me build a production-style Node.js backend for an AI-powered system.
This is NOT a toy project.
We are building a backend that will later process async AI jobs using AWS SQS.

---

## GOAL

Set up backend foundation with:

* Express server
* Postgres connection
* AWS SQS integration (send messages only)
* Jobs table
* API endpoints
* Clean architecture

NO worker yet
NO AI logic yet
NO scraping yet

We are only building the backend API that creates jobs and pushes them to SQS.

---

## TECH STACK

Node.js (CommonJS)
Express
PostgreSQL (pg)
AWS SDK v3 (SQS)
UUID
dotenv
cors
nodemon

---

## FOLDER STRUCTURE

Create:

src/
server.js
app.js
routes/
analyze.routes.js
controllers/
analyze.controller.js
services/
sqs.service.js
db/
index.js
config/
.env
package.json

---

## STEP 1: NPM SETUP

Initialize project.

Install dependencies:
express
cors
dotenv
pg
uuid
@aws-sdk/client-sqs

Dev:
nodemon

Add script:
"dev": "nodemon src/server.js"

---

## STEP 2: ENV VARIABLES

Create `.env`:

PORT=4000

DATABASE_URL=postgres://postgres:postgres@localhost:5432/agentdb

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
SQS_QUEUE_URL=YOUR_QUEUE_URL

Load dotenv in server.

---

## STEP 3: EXPRESS SERVER

Create app.js:

* enable cors
* parse json
* mount analyze routes at `/analyze`

Create server.js:

* load dotenv
* start server
* log port

---

## STEP 4: POSTGRES

Create db connection using pg Pool.

File:
src/db/index.js

Use DATABASE_URL.

---

## STEP 5: DATABASE SCHEMA

Include SQL comment for table creation:

jobs table:

* id UUID primary key
* name TEXT
* description TEXT
* status TEXT default 'pending'
* result JSONB
* created_at timestamp default now()

---

## STEP 6: SQS SERVICE

Create:
src/services/sqs.service.js

Initialize SQS client using AWS SDK v3.

Export function:
sendJobToQueue(job)

It should send message with:

* jobId
* name

Use SQS_QUEUE_URL from env.

---

## STEP 7: ROUTES

Create routes:

POST /analyze
GET /analyze/:id
GET /analyze/result/:id

---

## STEP 8: CONTROLLERS

createJob:

* accept { name, description }
* generate UUID
* insert job into Postgres with status "pending"
* send job to SQS
* return jobId + status

getJobStatus:

* query job status

getResult:

* query result field

Use async/await and try/catch.

---

## IMPORTANT RULES

Do NOT implement:

* worker
* AI
* scraping
* queue consumer

We are ONLY pushing to SQS.

---

## EXPECTED BEHAVIOR

POST /analyze
→ inserts job in DB
→ sends message to SQS
→ returns jobId

GET status endpoint works.

---

