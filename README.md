# 🧠 AI-Powered DSA Interview Coach

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Claude API](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)

An interactive, full-stack Data Structures and Algorithms (DSA) platform that goes beyond standard code execution. Built to simulate a real engineering interview, it features a Socratic AI coach that guides users through optimal time/space complexity trade-offs without spoiling the solution.

## ✨ Core Features

* **⚡ Real-Time Code Execution:** In-browser execution environment supporting 3+ languages (Python, C++, etc.). Optimized external sandbox payloads maintain a round-trip execution latency of **< 500ms**.
* **🤖 Socratic AI Coaching Layer:** Powered by the Claude API and strictly validated with Pydantic. The AI analyzes syntax and logic to deliver step-by-step algorithmic hints and complexity breakdowns—acting as a technical interviewer rather than an answer key.
* **💻 Pro-Grade IDE Experience:** Integrated **Monaco Editor** (the engine behind VS Code) with debounced state management to handle seamless syntax highlighting and live auto-completion without blocking the main UI thread.
* **🚄 High-Performance Data Layer:** Sub-50ms data retrieval for problem metadata and user submission histories, achieved via heavily indexed PostgreSQL queries.

## 🏗️ System Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js, TailwindCSS, Monaco Editor | Delivers a responsive, non-blocking IDE experience and dynamic UI. |
| **Backend** | FastAPI, Python | Handles execution routing, Pydantic data validation, and AI orchestration. |
| **Execution Engine** | Piston API / Docker Sandbox | Safely compiles and evaluates untrusted user code in isolated environments. |
| **Database** | Supabase (PostgreSQL) | Stores problem sets, user states, and submission histories with high read-throughput. |
| **Deployment** | Vercel (Web), Railway (API) | CI/CD pipelines ensuring zero-downtime updates and scalable hosting. |

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python 3.10+
* A Supabase project
* Anthropic (Claude) API Key

### Local Installation

**1. Clone the repository:**
```bash
git clone [https://github.com/AKXX05/DSA-Interview-Coach.git](https://github.com/AKXX05/DSA-Interview-Coach.git)
cd DSA-Interview-Coach
2. Setup the Frontend:

Bash
cd ai-dsa-coach-web
npm install
npm run dev
3. Setup the Backend:

Bash
# Open a new terminal instance in the root folder
cd backend-folder-name
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
Environment Variables
You will need to create .env files in both your frontend and backend directories.

Backend (.env):

Code snippet
CLAUDE_API_KEY=your_anthropic_key_here
DATABASE_URL=your_supabase_postgres_url
📈 Future Roadmap
[ ] Introduce dynamic database-driven driver code for seamless multi-problem scaling.

[ ] Add WebSocket support for real-time collaborative coding sessions.

[ ] Implement user authentication and progress heatmaps.

🌟 The Vision Behind the Code
I built this platform with a simple mission: to democratize technical interview prep.

Getting ready for internship season shouldn't require buying expensive courses or premium subscriptions. I wanted to create a world-class, completely free environment for my friends, college peers, and any student out there fighting for a seat in tech.

This platform is designed to mirror how real engineering interviews actually work. It pushes you to not just solve the problem, but to evolve it—starting from a brute-force approach, refining it into a better solution, and ultimately mastering the optimal code. All the while, the AI coach is there to challenge you with high-quality, conceptual follow-up questions, just like a real Senior Engineer would.

<blockquote>
  <h3 align="center">✨ <i>Tech is for everyone. Keep grinding.</i> ✨</h3>
</blockquote>

<p align="center">
  <b>Made with lots of love and faith by <a href="https://github.com/AKXX05">Alok Kumar</a></b>
  <br>
  <sub><sup>Empowering the next generation of engineers 🚀</sup></sub>
</p>