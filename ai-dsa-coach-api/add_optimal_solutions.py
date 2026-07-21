import os
import sys
import json
import time
from sqlalchemy import text
from dotenv import load_dotenv

# Force unbuffered output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
# Use the fresh coach key with ample quota to generate solutions
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_SOCRATIC_COACH") or os.getenv("GEMINI_API_KEY")

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not set in .env", flush=True)
    sys.exit(1)

if not GEMINI_API_KEY:
    print("[ERROR] GEMINI API key not set in .env", flush=True)
    sys.exit(1)

try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
except ImportError:
    print("[ERROR] Please install google-generativeai: pip install google-generativeai", flush=True)
    sys.exit(1)

# Import DB session
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine, SessionLocal
import models

def migrate_schema():
    print("[MIGRATION] Adding optimal solution columns to Supabase table...", flush=True)
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE problems ADD COLUMN IF NOT EXISTS optimal_solution_python TEXT;"))
            conn.execute(text("ALTER TABLE problems ADD COLUMN IF NOT EXISTS optimal_solution_cpp TEXT;"))
            conn.execute(text("ALTER TABLE problems ADD COLUMN IF NOT EXISTS optimal_solution_java TEXT;"))
            print("  └─ Schema columns migrated successfully!", flush=True)
        except Exception as e:
            print(f"  └─ Schema migration check: {e}", flush=True)

def clean_json_response(raw_text: str) -> str:
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        raw_text = "\n".join(lines).strip()
    return raw_text

def generate_optimal_solutions(problem):
    prompt = f"""You are an expert DSA developer. Generate the optimal, fully working solutions in Python, C++, and Java for the following coding interview problem.
    
    Problem Title: {problem.title}
    Description: {problem.description}
    Starter Code: {json.dumps(problem.starter_code)}
    
    STRICT REQUIREMENTS:
    1. Write the code for each language to solve the problem with optimal time and space complexity.
    2. The code MUST contain the Solution class and match the starter code method name and parameter types exactly.
    3. The return types and argument names MUST line up with the starter code.
    
    Return EXACTLY a raw JSON object with the following keys:
    {{
      "python": "complete working Python 3 Solution code",
      "cpp": "complete working C++ Solution class code",
      "java": "complete working Java Solution class code"
    }}
    Do not include markdown code blocks or any other explanation text. Output raw JSON only.
    """
    
    # Try gemini-flash-latest first (high quota limit)
    model = genai.GenerativeModel("gemini-flash-latest")
    
    for attempt in range(1, 4):
        try:
            response = model.generate_content(prompt)
            cleaned = clean_json_response(response.text)
            parsed = json.loads(cleaned)
            if "python" in parsed and "cpp" in parsed and "java" in parsed:
                return parsed
        except Exception as e:
            print(f"    [WARN] Attempt {attempt} failed: {e}", flush=True)
            time.sleep(2.0)
            
    return None

def main():
    migrate_schema()
    
    db = SessionLocal()
    problems = db.query(models.Problem).all()
    print(f"\n[START] Found {len(problems)} existing problems in Supabase database.", flush=True)
    
    success_count = 0
    skipped_count = 0
    
    for idx, p in enumerate(problems, start=1):
        # Skip if already has solutions populated
        if p.optimal_solution_python and p.optimal_solution_cpp and p.optimal_solution_java:
            print(f"[{idx}/{len(problems)}] Skipped Problem #{p.id} '{p.title}' (already populated)", flush=True)
            skipped_count += 1
            continue
            
        print(f"[{idx}/{len(problems)}] Generating optimal solutions for Problem #{p.id}: '{p.title}'...", flush=True)
        solutions = generate_optimal_solutions(p)
        
        if solutions:
            p.optimal_solution_python = solutions["python"]
            p.optimal_solution_cpp = solutions["cpp"]
            p.optimal_solution_java = solutions["java"]
            db.commit()
            print(f"  └─ Success! Solutions saved & committed to Supabase.", flush=True)
            success_count += 1
        else:
            print(f"  └─ Failed to generate valid solutions for '{p.title}'. Skipping.", flush=True)
            
        # Small delay to respect rate limits
        time.sleep(1.5)
        
    db.close()
    print("\n=========================================================", flush=True)
    print(f"[FINISHED] Migration run completed.", flush=True)
    print(f"  - Successfully updated: {success_count} problems", flush=True)
    print(f"  - Skipped (already done): {skipped_count} problems", flush=True)
    print("=========================================================", flush=True)

if __name__ == "__main__":
    main()
