You are a senior software engineer and technical writer.

Your task: Create a world-class README.md for this project called **Online Presence Agent**.

This README will be read by recruiters and engineers.  
It must be extremely clear, visually clean, and professional.  
The goal is to make the project feel polished, credible, and easy to run.

Tone:
- Concise but impressive
- No fluff
- Skimmable for busy recruiters
- Clear technical depth for engineers

Design rules:
- Use clean markdown formatting
- Use sections with emojis sparingly but professionally
- Use code blocks where appropriate
- Use tables for tech stack
- Make it feel like a top GitHub repo

---

## PROJECT CONTEXT

This project is an AI-powered agent that:
- Takes a person's name as input
- Finds their online presence across the web
- Aggregates links and appearances
- Uses LLMs + scraping/search APIs
- Returns a structured profile

It is a full-stack web application.

Assume:
- Backend: Node.js (Express or similar)
- Frontend: React
- Uses LLM APIs
- Uses search/scraping tools
- Async job processing + polling
- Clean modular architecture

Do NOT invent fake metrics.  
Keep claims realistic and believable.

---

## README STRUCTURE

Generate the README using this exact structure:

### 1. Hero Section
- Project title
- One-line description
- Short impressive summary
- Architecture diagram placeholder
- Demo GIF placeholder

Include markdown placeholders like:
![Demo](./assets/demo.gif)
![Architecture](./assets/architecture.png)

---

### 2. Why This Project Matters
Explain:
- Problem it solves
- Why it's interesting
- Why engineers should care

Keep it sharp and recruiter-friendly.

---

### 3. Features
Bullet list:
- Name search → presence aggregation
- LLM summarization
- Async job processing
- Polling system
- Structured output
- Modular architecture

Make it look production-minded.

---

### 4. Demo Section
Create a section with placeholders:

## 🎥 Demo
- Demo video: (add link)
- Screenshots: assets/screenshots/

Tell where to put files:
assets/
  demo.gif
  screenshots/
  architecture.png

---

### 5. Architecture Overview
Explain:
- Frontend → API → Worker → LLM → Results
- Polling flow
- Data pipeline

Add a simple ASCII diagram.

---

### 6. Tech Stack Table

| Layer | Tech |
|------|------|
| Frontend | React |
| Backend | Node.js |
| AI | LLM APIs |
| Search | Web APIs |
| Queue | (generic) |
| Storage | (generic) |

---

### 7. Folder Structure

Show realistic structure:
client/
server/
workers/
shared/
assets/

---

### 8. Installation (SUPER IMPORTANT)

This section must be extremely simple.

Write steps for:

#### Prerequisites
- Node >= 18
- npm
- API keys

#### Setup

git clone …
cd …
npm install

#### Backend
cd server
npm install
npm run dev

#### Frontend
cd client
npm install
npm start

#### Environment variables
Provide .env.example block.

Keep it clean and minimal.

---

### 9. How It Works (Flow)

Explain request lifecycle:
1. User submits name
2. Backend creates job
3. Worker searches web
4. LLM processes data
5. Result stored
6. Client polls
7. UI updates

---

### 10. Example Output

Show JSON sample.

---

### 11. Design Decisions
Explain:
- Why async pipeline
- Why polling
- Why modular architecture

Make this section impressive but concise.

---

### 12. Future Improvements
Short list.

---

### 13. Author Section
Professional:

Built by Puneeth  
Backend-focused full-stack engineer  
Interested in AI agents & scalable systems  

GitHub:  
LinkedIn:  

---

## STYLE REQUIREMENTS

- Clean spacing
- No long paragraphs
- Recruiter-friendly
- Looks like top GitHub repo
- Elegant markdown
- No emojis overload
- No cringe marketing language

---

## OUTPUT

Generate ONLY the README.md content.  
Do not explain anything.  
Make it production quality.