We are building a React frontend for an async AI backend.

Backend endpoints:

POST /analyze
GET /analyze/:id
GET /analyze/result/:id

We must build a UI with:

* form page
* requests list page
* job detail page
* polling logic
* clean modern UI

---

## GOAL

Flow:

1. User enters name + description
2. Click Analyze
3. POST /analyze
4. Redirect to /requests page
5. Requests page shows all jobs
6. Clicking a job opens detail view
7. If job pending → poll every 30 seconds
8. Show spinner + "Fetching results..."
9. When completed → show result

---

## TECH STACK

React (Vite)
React Router
Simple CSS
No heavy UI libs

---

## STEP 1: PROJECT STRUCTURE

client/
src/
pages/
Home.jsx
Requests.jsx
JobDetail.jsx
components/
Spinner.jsx
api.js
App.jsx

---

## STEP 2: ENV

client/.env

VITE_API_URL=[http://localhost:4000](http://localhost:4000)

---

## STEP 3: ROUTING

Use React Router.

Routes:

/ → Home (form)
/requests → list page
/requests/:id → job detail

---

## STEP 4: API HELPER

Create api.js

Functions:

createJob(data)
getJobStatus(id)
getJobResult(id)
getAllJobs()

---

## STEP 5: HOME PAGE

Home.jsx:

Inputs:

* name
* description

On submit:
POST /analyze

After response:
redirect to /requests

---

## STEP 6: REQUESTS PAGE

Requests.jsx:

Fetch all jobs from backend.

Display list:

* name
* description
* status
* created_at

Each item clickable.

Click → navigate to:
/requests/:id

Auto-refresh list every 10s.

---

## STEP 7: JOB DETAIL PAGE

JobDetail.jsx:

Show:
name
description
status

If status = pending or processing:

start polling every 30 seconds:
GET /analyze/:id

While waiting:
show spinner
text: "Fetching results..."

When status becomes completed:
fetch result:
GET /analyze/result/:id

Display JSON nicely.

Stop polling when done.

---

## STEP 8: SPINNER COMPONENT

Create Spinner.jsx:

CSS animated circle.

Centered.

Text below:
"Fetching results..."

---

## STEP 9: CLEAN UI

Design:

Centered container
Card layout
Rounded corners
Soft background
Minimal color palette

---

## STEP 10: STATE MANAGEMENT

Use React state + useEffect.

Do not use Redux.

---

## STEP 11: ERROR HANDLING

If request fails:
show message.

---

## EXPECTED UX

User submits job.
Redirects to requests page.
Sees job in list.
Clicks job.
Sees spinner.
After completion → result appears.

---

## IMPORTANT RULES

Do NOT add:
auth
advanced styling libs
complex state managers

Keep code clean and readable.

---

## AFTER IMPLEMENTATION

Explain:

* how polling works
* how routing works
* how requests list loads
