import os
from typing import List, Dict, Any, Optional
import models

# Socratic Coach system instructions
COACH_SYSTEM_INSTRUCTIONS = """You are a Socratic DSA Interview Coach. Your goal is to guide the candidate to solve the coding problem on their own, mirroring a real-life technical interview at a top tech company.

Strict Rules:
1. NEVER give the user the solution, code snippets, or direct corrections (e.g., do not say "change line 4 to x = 5" or provide corrected functions).
2. Use the Socratic method: ask high-quality, targeted guiding questions that help the user spot their own logical bugs, optimize their time/space complexity, or handle edge cases.
3. Identify the status of their code:
   - If they haven't written much, ask about their approach/plan (e.g. brute force vs optimized).
   - If their code failed compile/tests, help them understand the error or run-time result without giving the corrected code.
   - If their code is correct but sub-optimal, prompt them to optimize (e.g., "What is the time complexity of your current solution? Can we do better?").
4. Keep your responses concise, engaging, and professional. Speak like an encouraging technical interviewer.
5. If the candidate asks for the answer directly, gently refuse and ask a guiding question to help them take the next step.
"""

def format_chat_history(chat_history: List[Dict[str, str]]) -> str:
    formatted = []
    for msg in chat_history:
        role = "Candidate" if msg.get("role") == "user" else "Interviewer (Coach)"
        content = msg.get("content", "")
        formatted.append(f"{role}: {content}")
    return "\n".join(formatted)

async def stream_coach_response(
    problem: models.Problem,
    code: str,
    language: str,
    chat_history: List[Dict[str, str]],
    console_output: Optional[str] = None
):
    from dotenv import load_dotenv
    load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY_SOCRATIC_COACH") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        yield "⚠️ **Gemini API Key Missing**: Please set `GEMINI_API_KEY_SOCRATIC_COACH` or `GEMINI_API_KEY` in your `ai-dsa-coach-api/.env` file and restart your FastAPI server to enable the Socratic Coach."
        return

    try:
        import google.generativeai as genai
    except ImportError:
        yield "⚠️ **Missing dependency**: Run `pip install google-generativeai` in your venv to enable the Socratic Coach."
        return

    # Configure the Gemini client
    genai.configure(api_key=api_key)

    # Build the full context prompt
    constraints_str = "\n".join(f"- {c}" for c in (problem.constraints or []))
    starter_code_str = problem.starter_code.get(language, "") if problem.starter_code else ""
    formatted_history = format_chat_history(chat_history)

    prompt = f"""Here is the context of the interview session:

Problem Title: {problem.title}
Difficulty: {problem.difficulty}

Problem Description:
{problem.description}

Constraints:
{constraints_str}

Starter Code ({language}):
{starter_code_str}

Candidate's Current Code:
```{language}
{code}
```

Console Output / Execution Results (if code was run/submitted):
{console_output or "No output yet."}

---
Chat History so far:
{formatted_history}

Please respond to the candidate's last message as the Socratic Interviewer.
Remember: Do not give solutions or code. Ask leading/guiding questions instead.
"""

    # Use Gemini 1.5 Flash for fast, cost-efficient streaming
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=COACH_SYSTEM_INSTRUCTIONS
    )

    # Stream the response token by token
    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text
