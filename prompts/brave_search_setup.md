We already have:

* Express API
* Postgres with migrations
* AWS SQS producer
* Worker consuming jobs
* jobs table
* optional description field

Now implement **Day 3: Web Search + Page Fetching Pipeline using Brave Search API**.

This update MUST include proper handling of the Brave API key via environment variables.

---

## GOAL

When the worker processes a job:

1. Build search query from name + optional description
2. Call Brave Search API using API key from `.env`
3. Get top search results
4. Fetch page content
5. Store results in DB
6. Mark job completed

No LLM yet.

---

## STEP 1: ENV VARIABLES

Ensure `.env` contains:

BRAVE_API_KEY=YOUR_KEY

Also update `.env.example` to include:

BRAVE_API_KEY=

Worker must read key using:
process.env.BRAVE_API_KEY

If key missing:

* log error
* throw error
* stop processing job

---

## STEP 2: ADD SOURCES TABLE

Add migration in src/db/migrate.js:

CREATE TABLE IF NOT EXISTS sources (
id SERIAL PRIMARY KEY,
job_id UUID REFERENCES jobs(id),
url TEXT,
title TEXT,
snippet TEXT,
content TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

---

## STEP 3: BRAVE SEARCH SERVICE

Create:
src/worker/search.service.js

Requirements:

Function:
searchPerson(name, description)

1. Build search query:
   let query = name
   if description exists:
   query = name + " " + description

2. Read API key:
   const apiKey = process.env.BRAVE_API_KEY

3. If apiKey missing:
   throw error "Missing BRAVE_API_KEY"

4. Call Brave API:

GET [https://api.search.brave.com/res/v1/web/search?q=QUERY](https://api.search.brave.com/res/v1/web/search?q=QUERY)

Headers:
X-Subscription-Token: apiKey
Accept: application/json

5. Parse response and return:

[
{
title,
url,
snippet
}
]

Limit to top 5 results.

---

## STEP 4: PAGE FETCH SERVICE

Create:
src/worker/fetch.service.js

Use axios.

Function:
fetchPage(url)

* fetch HTML
* strip tags
* return text content
* limit to 5000 chars
* if fails → return null

---

## STEP 5: UPDATE PROCESS JOB

Modify:
src/worker/processJob.js

Flow:

1. set job status → processing
2. call searchPerson(name, description)
3. loop results
4. fetch page content
5. insert into sources table
6. update job result:
   { sourcesCollected: number }
7. set status → completed

---

## STEP 6: INSERT SOURCES INTO DB

INSERT INTO sources(job_id, url, title, snippet, content)
VALUES($1,$2,$3,$4,$5)

---

## STEP 7: LOGGING

Worker logs should show:

"Searching Brave for: QUERY"
"Found X results"
"Fetched page: URL"
"Inserted source"
"Job completed"

---

## EXPECTED BEHAVIOR

Start system:

docker compose up -d
npm run dev
npm run worker

Call:

POST /analyze
{
"name": "Satya Nadella",
"description": "Microsoft CEO"
}

Worker should:

* search Brave using key from env
* fetch pages
* store sources
* complete job

---

## ERROR HANDLING

If BRAVE_API_KEY missing:
log error and mark job failed.

---

## IMPORTANT RULES

Do NOT add:

* LLM
* embeddings
* vector DB

Only ingestion pipeline.

---

## AFTER IMPLEMENTATION

Explain:

* where Brave key is used
* how query is built
* how results stored
