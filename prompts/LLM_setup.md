We already have:

* Express API
* Postgres with migrations
* SQS worker
* Brave search pipeline
* sources table storing fetched pages
* jobs table

Now implement **LLM Extraction Pipeline**.

This step will convert collected sources into a structured profile using an LLM.

---

## GOAL

After worker collects sources for a job:

1. Combine source content
2. Send to LLM
3. Extract structured JSON
4. Store result in jobs table
5. Mark job completed

---

## STEP 1: ENV VARIABLES

Add to `.env`:

OPENAI_API_KEY=YOUR_KEY

Worker must read:
process.env.OPENAI_API_KEY

If missing:
throw error.

---

## STEP 2: LLM SERVICE

Create:
src/worker/llm.service.js

Use OpenAI SDK.

Export function:
callLLM(prompt)

Send prompt to model:
gpt-4o-mini (or configurable)

Return response text.

---

## STEP 3: EXTRACTION SERVICE

Create:
src/worker/extract.service.js

Function:
extractProfile(name, description, sources)

1. Combine sources into single text
2. Limit text length (avoid huge payload)
3. Build prompt asking for structured JSON

Prompt should request:

{
"summary": string,
"roles": [],
"companies": [],
"confidence": number,
"key_links": []
}

Return parsed JSON.

---

## STEP 4: UPDATE PROCESS JOB

Modify:
src/worker/processJob.js

After collecting sources:

1. fetch all sources for job
2. call extractProfile()
3. get structured result
4. update jobs table:

status = completed
result = JSON

---

## STEP 5: PROMPT DESIGN

Prompt must:

* include name + description
* include collected source snippets
* ask LLM to return only JSON
* no extra text

---

## STEP 6: ERROR HANDLING

If LLM fails:

* mark job failed
* log error

---

## EXPECTED BEHAVIOR

POST /analyze
{
"name": "Satya Nadella",
"description": "Microsoft CEO"
}

Worker should:

1. search web
2. fetch pages
3. call LLM
4. store structured profile

Check DB:
SELECT result FROM jobs;

Should contain JSON profile.

---

## IMPORTANT RULES

Do NOT add:

* vector DB
* embeddings
* chat interface

Only structured extraction.

---

## AFTER IMPLEMENTATION

Explain:

* how prompt works
* how JSON parsed
* how results stored
