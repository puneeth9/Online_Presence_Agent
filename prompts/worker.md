We already have a Node.js backend with:

* Express API
* Postgres (Docker)
* SQS producer
* Job table
* createJob endpoint

Now implement **SQS Worker + Background Processor**.

---

## GOAL

Create a separate worker process that:

1. Polls AWS SQS
2. Receives job messages
3. Updates job status to "processing"
4. Simulates processing
5. Updates job result
6. Marks job "completed"

This worker must be separate from API server.

---

## FOLDER STRUCTURE

Create:

src/worker/
worker.js
processJob.js

---

## STEP 1: SQS RECEIVE SERVICE

Create a function to:

* poll SQS
* receive messages
* parse JSON body
* delete message after processing

Use AWS SDK v3.

Use long polling:
WaitTimeSeconds: 10

---

## STEP 2: WORKER ENTRY FILE

Create:
src/worker/worker.js

This should:

1. connect to DB
2. start polling loop
3. process jobs continuously

Infinite loop pattern:
while(true)
receive messages
process each

Log:
"Worker started"

---

## STEP 3: JOB PROCESSOR

Create:
src/worker/processJob.js

Function:
processJob(job)

Steps:

1. update DB status → "processing"
2. simulate work (setTimeout 2s)
3. create fake result:
   { summary: "Processed for NAME" }
4. update DB:
   status = completed
   result = JSON

---

## STEP 4: DB QUERIES

Use pg pool.

Update status queries:
UPDATE jobs SET status='processing'
UPDATE jobs SET status='completed', result=$1

---

## STEP 5: DELETE MESSAGE FROM SQS

After successful processing:
delete message from queue.

---

## STEP 6: ERROR HANDLING

If processing fails:

* log error
* do not delete message
* message will retry

---

## STEP 7: START SCRIPT

Add script in package.json:

"worker": "node src/worker/worker.js"

---

## EXPECTED BEHAVIOR

Run:

docker compose up -d
npm run dev
npm run worker

Then call:

POST /analyze
{ "name": "Elon Musk" }

Worker should:

* receive job
* update status
* process
* complete job

GET /analyze/:id
→ completed

---

## IMPORTANT RULES

Do NOT add:

* AI logic
* scraping
* retries system
* batching

Just basic worker.

---

## AFTER IMPLEMENTING

Explain:

* how worker works
* how to run worker
* how SQS polling works
