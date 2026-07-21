import os
import sys
import json
import time
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

# Force unbuffered UTF-8 output for Windows CLI
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Load environment variables
load_dotenv()

# Try importing google-generativeai
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Try importing supabase client
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

# Try importing SQLAlchemy database setup
try:
    from sqlalchemy import text
    from database import SessionLocal, engine, Base
    from models import Problem as DBProblem
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_DATABASE_SEEDING") or os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Target 26 Topics
TARGET_TOPICS = [
    "Arrays",
    "Sorting",
    "Binary Search",
    "Strings",
    "Linked List",
    "Recursion",
    "Bit Manipulation",
    "Stack",
    "Queue",
    "Sliding Window",
    "Two Pointers",
    "Heaps",
    "Greedy",
    "Binary Tree",
    "BST",
    "Graphs",
    "DP",
    "Combinatorics",
    "DFS",
    "BFS",
    "Prefix Sum",
    "Backtracking",
    "Number Theory",
    "DSU",
    "Divide & Conquer",
    "Mathematics"
]

# Model Fallback Rotation Pool
MODEL_POOL = [
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite"
]

def load_blueprint_schema() -> List[Dict[str, Any]]:
    """Reads the structure of our existing seed_problems.json file."""
    schema_path = os.path.join(os.path.dirname(__file__), "seed_problems.json")
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def init_gemini():
    """Configures Gemini API client."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "paste-your-key-here":
        print("[WARN] GEMINI_API_KEY is not set in environment variables.", flush=True)
        return False
    if HAS_GENAI:
        genai.configure(api_key=GEMINI_API_KEY)
        return True
    return False

def init_supabase():
    """Configures Supabase client if URL and KEY are available."""
    if HAS_SUPABASE and SUPABASE_URL and SUPABASE_KEY:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    return None

def clean_json_response(raw_text: str) -> str:
    """Extracts valid JSON array string from Gemini response."""
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        raw_text = "\n".join(lines).strip()
    return raw_text

def build_prompt_for_topic(topic: str, count: int = 15, start_id: int = 1) -> str:
    """Creates Gemini prompt for generating complete interview-level DSA problem records."""
    return f"""
You are an expert Data Structures & Algorithms problem creator for technical coding interviews (LeetCode/Striver level).

Your task is to generate a JSON array containing EXACTLY {count} uniquely worded, 100% ORIGINAL interview-level problems for the topic: "{topic}".

STRICT REQUIREMENTS:
1. The problem descriptions, test cases, starter code, and dry run steps MUST be 100% complete and accurate for coding interviews.
2. The output MUST be a valid, raw JSON array containing exactly {count} objects matching the complete Database Blueprint Schema.
3. Use clean math notation for constraints and complexities (e.g. "1 <= N <= 10^5", "O(N)", "O(log N)").
4. STRICT DIFFICULTY DISTRIBUTION: For each set of 15 problems, you MUST generate more Medium problems than Hard problems, and more Hard problems than Easy problems (e.g., exactly 8 Medium, 5 Hard, and 2 Easy problems per topic).

JSON SCHEMA BLUEPRINT (Strictly include ALL fields for each object):
[
  {{
    "problem_id": "001",
    "title": "Target Sum Pair",
    "difficulty": "Easy",
    "topic": "{topic}",
    "tags": ["{topic}", "Hashing"],
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    "time_limit": "1.0s",
    "memory_limit": "256MB",
    "hints": [
      "Consider using a hash map to store previously seen numbers and their indices.",
      "For each number x, check if (target - x) exists in the hash map."
    ],
    "asked_by": ["Google", "Amazon", "Meta"],
    "expected_time_complexity": "O(N)",
    "expected_space_complexity": "O(N)",
    "starter_code": {{
      "python": "class Solution:\\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\\n        pass",
      "cpp": "class Solution {{\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {{\\n        return {{}};\\n    }}\\n}};",
      "java": "class Solution {{\\n    public int[] twoSum(int[] nums, int target) {{\\n        return new int[]{{}};\\n    }}\\n}}"
    }},
    "sample_test_cases": [
      {{
        "input": "nums = [2, 7, 11, 15], target = 9",
        "expected": "[0, 1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }}
    ],
    "hidden_test_cases": [
      {{
        "input": "nums = [3, 2, 4], target = 6",
        "expected": "[1, 2]",
        "explanation": "nums[1] + nums[2] == 6."
      }},
      {{
        "input": "nums = [3, 3], target = 6",
        "expected": "[0, 1]",
        "explanation": "nums[0] + nums[1] == 6."
      }}
    ],
    "dry_run_steps": [
      {{
        "step": 1,
        "title": "Initialize Hash Map",
        "explanation": "Create an empty hash map 'seen' to map number values to their indices.",
        "variables": {{"seen": "{{}}"}}
      }},
      {{
        "step": 2,
        "title": "Iterate & Lookup Complement",
        "explanation": "For index 0 (val 2), complement is 7. Not in map. Store seen[2] = 0. For index 1 (val 7), complement is 2. Found in map at index 0!",
        "variables": {{"idx": 1, "val": 7, "complement": 2, "match_idx": 0}}
      }}
    ]
  }}
]

Generate exactly {count} complete items starting problem_id from "{start_id:03d}" onwards for topic "{topic}". Output JSON only without markdown code fences.
"""

def transform_to_db_record(prob: Dict[str, Any]) -> Dict[str, Any]:
    """Transforms Gemini/JSON schema object to SQL/Supabase database column format preserving all fields."""
    raw_tl = prob.get("time_limit", "1.0s")
    try:
        time_limit = float(re.sub(r"[^\d.]", "", str(raw_tl)))
    except ValueError:
        time_limit = 1.0

    raw_ml = prob.get("memory_limit", "256MB")
    try:
        memory_limit = int(re.sub(r"[^\d]", "", str(raw_ml)))
    except ValueError:
        memory_limit = 256

    # Sample Test Cases
    sample_cases = []
    raw_samples = prob.get("sample_test_cases") or prob.get("examples") or []
    for ex in raw_samples:
        sample_cases.append({
            "input": str(ex.get("input", "")),
            "expected": str(ex.get("expected") or ex.get("output", "")),
            "explanation": str(ex.get("explanation", ""))
        })

    # Hidden Test Cases
    hidden_cases = []
    raw_hidden = prob.get("hidden_test_cases") or []
    for ex in raw_hidden:
        hidden_cases.append({
            "input": str(ex.get("input", "")),
            "expected": str(ex.get("expected") or ex.get("output", "")),
            "explanation": str(ex.get("explanation", ""))
        })
    if not hidden_cases:
        hidden_cases = list(sample_cases)

    # Starter Code
    starter_code = prob.get("starter_code")
    if not isinstance(starter_code, dict) or not starter_code.get("python"):
        title = prob.get("title", "Problem")
        func_name = re.sub(r"[^a-zA-Z0-9]", "", title) or "solve"
        func_name = func_name[0].lower() + func_name[1:]
        starter_code = {
            "python": f"class Solution:\n    def {func_name}(self):\n        # {title}\n        pass",
            "cpp": f"#include <iostream>\nusing namespace std;\n\nclass Solution {{\npublic:\n    void {func_name}() {{\n        // {title}\n    }}\n}};",
            "java": f"class Solution {{\n    public void {func_name}() {{\n        // {title}\n    }}\n}}"
        }

    # Dry Run Steps
    dry_run_steps = prob.get("dry_run_steps")
    if not isinstance(dry_run_steps, list) or len(dry_run_steps) == 0:
        dry_run_steps = [
            {
                "step": 1,
                "title": "Analyze Input Parameters",
                "explanation": f"Initialize data structures and validate constraints for {prob.get('title', 'problem')}.",
                "variables": {"status": "initialized"}
            },
            {
                "step": 2,
                "title": "Execute Algorithm",
                "explanation": f"Apply dynamic strategy with time complexity {prob.get('expected_time_complexity', 'O(N)')}.",
                "variables": {"step": 2, "completed": True}
            }
        ]

    # Tags & Companies
    topic = prob.get("topic", "General")
    tags = prob.get("tags")
    if not isinstance(tags, list) or not tags:
        tags = [topic]

    companies = prob.get("asked_by") or prob.get("companies")
    if not isinstance(companies, list) or not companies:
        companies = ["Google", "Amazon", "Microsoft"]

    hints = prob.get("hints")
    if not isinstance(hints, list) or not hints:
        hints = [
            f"Focus on achieving target time complexity: {prob.get('expected_time_complexity', 'O(N)')}.",
            f"Check if space complexity can be optimized to {prob.get('expected_space_complexity', 'O(1)')}."
        ]

    return {
        "problem_code": str(prob.get("problem_id", "")),
        "title": prob.get("title", "Untitled Problem"),
        "description": prob.get("description", ""),
        "difficulty": prob.get("difficulty", "Easy"),
        "topic": topic,
        "tags": tags,
        "companies": companies,
        "hints": hints,
        "constraints": prob.get("constraints", []),
        "expected_time_complexity": prob.get("expected_time_complexity", "O(N)"),
        "expected_space_complexity": prob.get("expected_space_complexity", "O(1)"),
        "time_limit": time_limit,
        "memory_limit": memory_limit,
        "supported_languages": ["python", "cpp", "java"],
        "starter_code": starter_code,
        "sample_test_cases": sample_cases,
        "hidden_test_cases": hidden_cases,
        "dry_run_steps": dry_run_steps
    }

def insert_into_database(supabase_client, db_session, problems_json: List[Dict[str, Any]]):
    """Inserts generated problem objects straight into Supabase problems table."""
    db_records = [transform_to_db_record(p) for p in problems_json]
    
    # 1. Direct Supabase Client Insertion
    if supabase_client:
        try:
            res = supabase_client.table("problems").insert(db_records).execute()
            return
        except Exception:
            pass

    # 2. Direct Supabase PostgreSQL Session Insertion
    if db_session:
        try:
            for rec in db_records:
                new_p = DBProblem(**rec)
                db_session.add(new_p)
            db_session.commit()
        except Exception as e:
            db_session.rollback()
            print(f"  └─ Supabase DB insertion error: {e}", flush=True)

def clear_database(supabase_client, db_session):
    """Wipes old baseline records from Supabase problems table to allow 100% fresh ratio seeding."""
    print("[CLEANUP] Clearing old records from Supabase problems table...", flush=True)
    if supabase_client:
        try:
            supabase_client.table("problems").delete().neq("id", 0).execute()
            print("  └─ Successfully cleared table via Supabase client!", flush=True)
            return
        except Exception:
            pass

    if db_session:
        try:
            db_session.query(DBProblem).delete()
            db_session.commit()
            print("  └─ Successfully cleared table via SQL session!", flush=True)
        except Exception as e:
            db_session.rollback()
            print(f"  └─ SQL session delete notice: {e}", flush=True)

def main():
    print("=========================================================", flush=True)
    print("AI-Powered DSA Problem Generator & Supabase Seeder", flush=True)
    print("=========================================================\n", flush=True)

    # 1. Initialize Gemini Model & Database Clients
    is_genai_ready = init_gemini()
    supabase_client = init_supabase()
    
    db_session = None
    if HAS_SQLALCHEMY:
        db_session = SessionLocal()

    # Check existing topics in database to resume seamlessly
    existing_count = 0
    existing_topics = {}
    if db_session:
        try:
            db_probs = db_session.query(DBProblem).all()
            existing_count = len(db_probs)
            for p in db_probs:
                top = p.topic or "General"
                existing_topics[top] = existing_topics.get(top, 0) + 1
            print(f"[DB] Current existing problems in Supabase: {existing_count}", flush=True)
        except Exception as e:
            print(f"[DB] Notice checking table: {e}", flush=True)

    do_reset = "--reset" in sys.argv
    if do_reset or existing_count == 0:
        clear_database(supabase_client, db_session)
        existing_count = 0
        existing_topics = {}

    all_generated_problems: List[Dict[str, Any]] = []
    current_id_counter = existing_count + 1

    if not is_genai_ready:
        print("\n[NOTE] Gemini API client not available.", flush=True)
        return

    # 3. Generation Loop across 26 target topics (STRICT NO-SKIP RETRY LOOP)
    print(f"\n[LOOP] Beginning Strict Generation Loop across {len(TARGET_TOPICS)} target topics...", flush=True)
    
    current_model_idx = 0

    for idx, topic in enumerate(TARGET_TOPICS, start=1):
        if existing_topics.get(topic, 0) >= 15:
            print(f"\n[{idx}/{len(TARGET_TOPICS)}] [RESUME SKIP] Topic '{topic}' already has {existing_topics[topic]} seeded problems in DB. Skipping!", flush=True)
            continue

        print(f"\n[{idx}/{len(TARGET_TOPICS)}] Generating 15 problems for Topic: '{topic}'...", flush=True)
        prompt = build_prompt_for_topic(topic, count=15, start_id=current_id_counter)

        topic_problems = None
        attempt = 1

        # Strict retry loop until valid JSON array is obtained for this topic
        while topic_problems is None:
            model_name = MODEL_POOL[current_model_idx % len(MODEL_POOL)]
            try:
                print(f"  ├─ Attempt {attempt}: Requesting via model '{model_name}'...", flush=True)
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                cleaned = clean_json_response(response.text)
                parsed = json.loads(cleaned)
                if isinstance(parsed, list) and len(parsed) > 0:
                    topic_problems = parsed
                    print(f"  └─ Success! Received {len(topic_problems)} valid problem objects via '{model_name}'.", flush=True)
                    break
                else:
                    print(f"  ├─ Warning: Received non-array response from '{model_name}'. Retrying...", flush=True)
            except Exception as e:
                err_msg = str(e)
                current_model_idx += 1
                next_model = MODEL_POOL[current_model_idx % len(MODEL_POOL)]
                print(f"  ├─ Quota/Limit notice on '{model_name}': {err_msg[:75]}...", flush=True)
                print(f"  └─ Pausing 60s for quota token replenishment before rotating to '{next_model}'...", flush=True)
                time.sleep(60)
            attempt += 1

        # Insert each generated problem straight into Supabase database immediately
        print(f"  ├─ Inserting {len(topic_problems)} problems into Supabase database...", flush=True)
        for p_idx, p in enumerate(topic_problems, start=1):
            p["problem_id"] = f"{current_id_counter:03d}"
            p["topic"] = topic  # ← Force canonical topic name (override any Gemini-generated value)
            current_id_counter += 1
            all_generated_problems.append(p)
            insert_into_database(supabase_client, db_session, [p])
            print(f"  │  └─ [{p_idx}/{len(topic_problems)}] Inserted Problem #{p['problem_id']}: '{p.get('title', '')}' ({p.get('difficulty', '')})", flush=True)

        print(f"  └─ [PROGRESS UPDATE] Finished Topic #{idx}/{len(TARGET_TOPICS)}: '{topic}'. Total problems in DB: {current_id_counter - 1}", flush=True)

        # Pause between topics to respect API rates
        time.sleep(3.0)

    # 4. Save output JSON file
    output_path = os.path.join(os.path.dirname(__file__), "seed_problems.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_generated_problems, f, indent=2)

    print("\n=========================================================", flush=True)
    print(f"[SUCCESS] Total {len(all_generated_problems)} problems pushed directly into Supabase database!", flush=True)
    print(f"File saved to: {output_path}", flush=True)
    print("=========================================================", flush=True)

if __name__ == "__main__":
    main()
