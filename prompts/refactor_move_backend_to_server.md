We are refactoring an existing Node.js backend project.

Current structure (repo root):

src/
server.js
worker/
services/
db/

.env
package.json
node_modules/
docker-compose.yml

We want to move all backend code into a new folder named:

server/

This will separate backend and future frontend code.

---

## FINAL TARGET STRUCTURE

repo/
server/
src/
server.js
worker/
services/
db/
package.json
.env
docker-compose.yml
node_modules/
prompts/
README.md

A frontend folder will be added later as `client/`.

---

## GOAL

Move backend into `server/` without breaking:

* API server
* worker
* migrations
* docker postgres
* SQS worker
* environment variables

After refactor, we must still be able to run:

cd server
npm run dev
npm run worker

---

## STEP 1: CREATE SERVER FOLDER

Create new folder at repo root:

server/

---

## STEP 2: MOVE BACKEND FILES INTO SERVER

Move the following into `server/`:

src/
package.json
.env
node_modules/
docker-compose.yml

Do NOT move:
.git
README.md
prompts/

---

## STEP 3: VERIFY SERVER PACKAGE.JSON

Inside server/package.json ensure scripts:

"scripts": {
"dev": "nodemon src/server.js",
"worker": "nodemon src/worker/worker.js"
}

Do not change these paths.

---

## STEP 4: FIX RELATIVE IMPORTS

Check imports in:

src/server.js
src/worker/worker.js
services
db

All imports should be relative like:

require("./services/...")
require("../db/...")

Do NOT use root-based imports.

No changes needed if already relative.

---

## STEP 5: ROOT .GITIGNORE

At repo root, update .gitignore:

node_modules
.env
server/node_modules
server/.env
client/node_modules
client/.env

---

## STEP 6: OPTIONAL ROOT PACKAGE.JSON

Create package.json at repo root:

{
"scripts": {
"dev:server": "cd server && npm run dev",
"dev:worker": "cd server && npm run worker"
}
}

This allows running backend from root.

---

## STEP 7: DOCKER FILE CHECK

docker-compose.yml should remain inside server/.

To run Postgres:

cd server
docker compose up -d

---

## STEP 8: VERIFY ENV

server/.env must contain:

DATABASE_URL
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SQS_QUEUE_URL
BRAVE_API_KEY
OPENAI_API_KEY

---

## STEP 9: TEST EVERYTHING

After refactor run:

cd server
npm install
docker compose up -d
npm run dev

Open second terminal:

cd server
npm run worker

Test:

POST /analyze

Ensure:

* job inserted
* worker processes
* DB updates

---

## STEP 10: GIT COMMIT

After confirming working:

git add .
git commit -m "refactor: move backend into server folder"

---

## IMPORTANT RULES

Do NOT change logic.
Do NOT rename files.
Do NOT modify worker code.
Only move folders and update paths if needed.

---

## AFTER IMPLEMENTATION

Explain:

* new structure
* how to run backend
* how to run worker
* how to add frontend later
