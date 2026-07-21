<div align="center">

# 🧠 AI-Powered DSA Interview Coach

### Practice DSA the way real interviews actually work — with an AI coach that guides, not spoils

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

![GitHub stars](https://img.shields.io/github/stars/AKXX05/DSA-Interview-Coach?style=for-the-badge&color=gold)
![GitHub last commit](https://img.shields.io/github/last-commit/AKXX05/DSA-Interview-Coach?style=for-the-badge)

</div>

<br>

An interactive, full-stack Data Structures and Algorithms (DSA) platform that goes beyond standard code execution. Built to simulate a real engineering interview, it features a **Socratic AI coach** that guides users through optimal time/space complexity trade-offs — without ever spoiling the solution.

---

## ✨ Core Features

- **⚡ Native Internal Execution Engine** — Zero-latency code execution engine using OS-level subprocess compilation. Drops execution latency down to **~100ms** and removes all third-party API dependencies.
- **🤖 Socratic AI Coaching Layer** — Powered by the Gemini API and strictly validated with Pydantic. The AI analyzes syntax and logic to deliver step-by-step algorithmic hints and complexity breakdowns, acting as a technical interviewer rather than an answer key.
- **💻 Pro-Grade IDE Experience** — Integrated Monaco Editor (the engine behind VS Code) with debounced state management for seamless syntax highlighting and live auto-completion, without blocking the main UI thread.
- **🚄 High-Performance Data Layer** — Sub-50ms data retrieval for problem metadata and submission histories, backed by heavily indexed PostgreSQL queries.

## 🏗️ System Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js, Tailwind CSS, Monaco Editor | Responsive, non-blocking IDE experience and dynamic UI |
| **Backend** | FastAPI, Python | Execution routing, Pydantic validation, AI orchestration |
| **Execution Engine** | Native Subprocess / OS-level Compilers (g++, Python3, OpenJDK) | Zero-latency local execution without third-party API limits |
| **Database** | Supabase (PostgreSQL) | Stores problem sets, user state, and submission histories |
| **Deployment** | Vercel (Web), Railway (API) | CI/CD pipelines for zero-downtime, scalable hosting |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.10+
- `g++ (GCC)` (Optional for local Python-only testing)
- `Java JDK 17+` (Optional for local Python-only testing)
- A Supabase project
- Google Gemini API key

### Local Installation

**1. Clone the repository**

```bash
git clone https://github.com/AKXX05/DSA-Interview-Coach.git
cd DSA-Interview-Coach
```

**2. Set up the frontend**

```bash
cd ai-dsa-coach-web
npm install
npm run dev
```

**3. Set up the backend**

```bash
# In a new terminal, from the project root
cd ai-dsa-coach-api
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🔐 Environment Variables

Create a `.env` file in the backend, and a `.env.local` file in the frontend.

**Backend — `ai-dsa-coach-api/.env`**

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_supabase_postgres_url
```

**Frontend — `ai-dsa-coach-web/.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📈 Future Roadmap

- [ ] Dynamic, database-driven driver code for seamless multi-problem scaling
- [ ] WebSocket support for real-time collaborative coding sessions
- [ ] User authentication and progress heatmaps

## 🌟 The Vision Behind the Code

I built this platform with a simple mission: to democratize technical interview prep.

Getting ready for internship season shouldn't require buying expensive courses or premium subscriptions. I wanted to create a world-class, completely free environment for my friends, college peers, and any student out there fighting for a seat in tech.

This platform is designed to mirror how real engineering interviews actually work. It pushes you to not just solve the problem, but to evolve it — starting from a brute-force approach, refining it into a better solution, and ultimately mastering the optimal code. All the while, the AI coach is there to challenge you with high-quality, conceptual follow-up questions, just like a real senior engineer would.

---

<div align="center">

### ✨ *Tech is for everyone. Keep grinding.* ✨

**Made with lots of love and faith by [Alok Kumar](https://github.com/AKXX05)**

<sub>Empowering the next generation of engineers 🚀</sub>

</div>