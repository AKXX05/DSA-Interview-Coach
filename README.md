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

An interactive, full-stack Data Structures and Algorithms (DSA) platform engineered to outpace standard coding sites. Built to simulate a real engineering interview, it trains developers to reason through time/space complexity trade-offs, draft algorithms, and perform under pressure—all guided by a Socratic AI coach that never spoils the solution.

### 📊 How We Compare

| Feature | Standard Coding Platforms | Our DSA Platform |
| :--- | :--- | :--- |
| **Primary Goal** | Passing hidden test cases | Passing the real technical interview |
| **Workflow** | Jump straight to writing code | Algorithm-first drafting & pseudocode |
| **When You Get Stuck** | Read spoiler solutions or forums | Socratic AI Coach provides tailored Big-O hints |
| **Execution Engine** | Sluggish third-party APIs (1–3s latency) | Native OS-level subprocess compilation (<100ms) |
| **Editor Experience** | Basic web text boxes | Integrated Monaco Editor (VS Code engine) |
| **Time Management** | Infinite time, trial and error | Built-in pressure timers for interview simulation |

---

## ✨ Core Features

### 🎯 The Interview Simulator
* **Structured Algorithm Drafting**: Forces users to slow down and write out their approach and pseudocode before touching the code editor—mirroring the whiteboard phase of a real tech interview.
* **Pressure-Tested Environment**: Built-in interview timers and custom test-case runners train users to manage their time and test their own logic under constraints.

### 📚 Comprehensive Topic Coverage
Features a meticulously curated catalog of fundamental and advanced DSA problems spanning every crucial interview topic, organized for progressive mastery:
* **Core Data Structures**: Arrays, Strings, Linked Lists, Stacks, Queues, Binary Trees, BSTs, Heaps, and Graphs.
* **Algorithmic Patterns**: Two Pointers, Sliding Window, Prefix Sum, Binary Search, Sorting, Recursion, Greedy, and Divide & Conquer.
* **Advanced Techniques**: Dynamic Programming (DP), DFS, BFS, Backtracking, Bit Manipulation, DSU (Disjoint Set Union), Combinatorics, Number Theory, and Mathematics.

### 🤖 Socratic AI Coaching Layer
* **Zero-Spoiler Guidance**: Powered by the Gemini API and strictly validated with Pydantic. The AI analyzes syntax and logic to deliver step-by-step algorithmic hints and Big-O complexity breakdowns, acting as a true senior interviewer rather than a simple answer key.

### 💻 Pro-Grade IDE Experience
* **VS Code in the Browser**: Integrated Monaco Editor with debounced state management for seamless syntax highlighting, multi-language support (Python, C++, Java), and live auto-completion, without blocking the main UI thread.

### ⚡ Native Internal Execution Engine
* **Zero-Latency Sandboxing**: Bypasses sluggish external APIs by using OS-level subprocess compilation (Python3, g++, OpenJDK). Drops code execution latency down to **~100ms** for instant feedback on custom test cases.

### 🚄 High-Performance Data Layer
* **Optimized Queries**: Sub-50ms data retrieval for problem metadata, test cases, and user submission histories, backed by heavily indexed PostgreSQL queries.

---

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