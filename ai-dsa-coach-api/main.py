from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import json
import re

import models
import schemas
from database import get_db

app = FastAPI(title="AI Powered DSA Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI Powered DSA Coach API!",
        "documentation": "/docs",
        "endpoints": {
            "problems": "/api/problems",
            "coach": "/api/coach",
            "generate_problem": "/api/generate-problem"
        }
    }

LANGUAGE_MAP = {
    "python": "python",
    "cpp": "c++",
    "java": "java"
}

HIDDEN_DRIVERS = {
    "python": """
# --- Hidden Test Runner ---
import sys, json, re, inspect

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        sol = Solution()
        # Find the first callable method on Solution (not dunder)
        method = next(
            (getattr(sol, m) for m in dir(sol)
             if not m.startswith('_') and callable(getattr(sol, m))),
            None
        )
        if method is None:
            print("===RESULT===")
            print("ERROR: No method found on Solution")
            sys.exit(1)

        sig = inspect.signature(method)
        params = list(sig.parameters.keys())

        args = []
        for param in params:
            # Try to find param = [...] or param = value in input
            arr_match = re.search(rf'{re.escape(param)}\\s*=\\s*\\[([^\\]]*?)\\]', raw_input)
            int_match = re.search(rf'{re.escape(param)}\\s*=\\s*(-?\\d+)', raw_input)
            str_match = re.search(rf'{re.escape(param)}\\s*=\\s*"([^"]*)"', raw_input)
            if arr_match:
                try:
                    args.append(json.loads(f"[{arr_match.group(1)}]"))
                except Exception:
                    args.append([])
            elif int_match:
                args.append(int(int_match.group(1)))
            elif str_match:
                args.append(str(str_match.group(1)))
            else:
                # Try raw JSON value
                raw_match = re.search(rf'{re.escape(param)}\\s*=\\s*(.+?)(?:,\\s*\\w+\\s*=|$)', raw_input)
                if raw_match:
                    try:
                        args.append(json.loads(raw_match.group(1).strip()))
                    except Exception:
                        args.append(raw_match.group(1).strip())

        try:
            result = method(*args)
            print("===RESULT===")
            if isinstance(result, list):
                print(json.dumps(result, separators=(',', ':')))
            else:
                print(result)
        except Exception as e:
            print("===RESULT===")
            print(f"ERROR: {e}")
""",
    "cpp": """
// Static fallback cpp driver
""",
    "java": """
// --- Hidden Generic Java Test Runner ---
import java.util.*;
import java.lang.reflect.*;
import java.util.regex.*;

class HiddenRunner {
    private static List<Integer> parseIntArray(String input, String key) {
        Pattern p = Pattern.compile(key + "\\\\s*=\\\\s*\\\\[([^\\\\]]*)\\\\]");
        Matcher m = p.matcher(input);
        List<Integer> result = new ArrayList<>();
        if (m.find()) {
            String[] tokens = m.group(1).split(",");
            for (String t : tokens) {
                t = t.trim();
                if (!t.isEmpty()) {
                    try { result.add(Integer.parseInt(t)); } catch (Exception ignored) {}
                }
            }
        }
        return result;
    }

    private static int parseIntVal(String input, String key) {
        Pattern p = Pattern.compile(key + "\\\\s*=\\\\s*(-?\\\\d+)");
        Matcher m = p.matcher(input);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    private static String parseStringVal(String input, String key) {
        Pattern p = Pattern.compile(key + "\\\\s*=\\\\s*\\"([^\\"]*)\\\"");
        Matcher m = p.matcher(input);
        return m.find() ? m.group(1) : null;
    }

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (scanner.hasNextLine()) sb.append(scanner.nextLine()).append(" ");
        String input = sb.toString().trim();

        Solution sol = new Solution();
        Method[] methods = Solution.class.getDeclaredMethods();
        Method target = null;
        for (Method method : methods) {
            if (!method.getName().startsWith("lambda") && !method.getName().equals("main")) {
                target = method;
                break;
            }
        }
        if (target == null) {
            System.out.println("===RESULT===");
            System.out.println("ERROR: No method found on Solution");
            return;
        }

        Class<?>[] paramTypes = target.getParameterTypes();
        Object[] callArgs = new Object[paramTypes.length];
        // Possible parameter names to try in order
        String[] arrayKeys = {"nums", "arr", "a", "heights", "cost", "prices"};
        String[] intKeys = {"k", "target", "n", "m", "limit", "threshold"};

        int arrayIdx = 0, intIdx = 0;
        for (int i = 0; i < paramTypes.length; i++) {
            Class<?> t = paramTypes[i];
            if (t == int[].class || t == Integer[].class || t.getName().contains("List")) {
                String key = arrayIdx < arrayKeys.length ? arrayKeys[arrayIdx++] : "nums";
                List<Integer> vals = parseIntArray(input, key);
                if (t == int[].class) {
                    int[] arr = new int[vals.size()];
                    for (int j = 0; j < vals.size(); j++) arr[j] = vals.get(j);
                    callArgs[i] = arr;
                } else if (t == Integer[].class) {
                    callArgs[i] = vals.toArray(new Integer[0]);
                } else {
                    callArgs[i] = vals;
                }
            } else if (t == int.class || t == Integer.class) {
                String key = intIdx < intKeys.length ? intKeys[intIdx++] : "k";
                callArgs[i] = parseIntVal(input, key);
            } else if (t == String.class) {
                String key = "s";
                String sv = parseStringVal(input, key);
                callArgs[i] = sv != null ? sv : "";
            } else {
                callArgs[i] = null;
            }
        }

        try {
            Object result = target.invoke(sol, callArgs);
            System.out.println("===RESULT===");
            if (result instanceof int[]) {
                System.out.println(Arrays.toString((int[]) result).replace(" ", ""));
            } else if (result instanceof List) {
                System.out.println(result.toString().replace(", ", ",").replace("[", "[").replace("]", "]"));
            } else {
                System.out.println(result);
            }
        } catch (Exception e) {
            System.out.println("===RESULT===");
            System.out.println("ERROR: " + e.getCause());
        }
    }
}
"""
}

LOCAL_PISTON_URL = os.getenv("LOCAL_PISTON_URL", "http://127.0.0.1:2000/api/v2/execute")
PUBLIC_PISTON_URL = "https://emkc.org/api/v2/piston/execute"

# Helper: extract method name and parameter count from C++ Solution class
def extract_cpp_method_info(code: str):
    """Finds method name and parameter count from C++ Solution class."""
    import re
    match = re.search(
        r'(?:int|long long|long|double|float|bool|string|void|vector\s*<[^>]+>|pair\s*<[^>]+>)\s+'
        r'([a-zA-Z_]\w*)\s*\(([^)]*)\)',
        code
    )
    if match:
        name = match.group(1)
        params_str = match.group(2).strip()
        if name not in ("Solution", "main", "if", "for", "while", "return"):
            param_count = 0 if not params_str else len(params_str.split(','))
            return name, param_count
    return "solve", 1


def build_cpp_driver(code: str) -> str:
    """Builds a C++ main() driver that calls the actual method extracted from user code."""
    method, param_count = extract_cpp_method_info(code)
    
    if param_count == 2:
        call_expr = f"sol.{method}(nums, k)"
    elif param_count >= 3:
        call_expr = f"sol.{method}(nums, k, target)"
    else:
        call_expr = f"sol.{method}(nums)"

    return f"""
// --- Hidden Generic Test Runner ---
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <regex>
#include <algorithm>
using namespace std;

vector<int> parseIntArray(const string& s) {{
    vector<int> result;
    string clean = s;
    clean.erase(remove(clean.begin(), clean.end(), '['), clean.end());
    clean.erase(remove(clean.begin(), clean.end(), ']'), clean.end());
    stringstream ss(clean);
    string token;
    while (getline(ss, token, ',')) {{
        while (!token.empty() && isspace((unsigned char)token[0])) token.erase(0, 1);
        while (!token.empty() && isspace((unsigned char)token.back())) token.pop_back();
        if (!token.empty()) {{
            try {{ result.push_back(stoi(token)); }} catch (...) {{}}
        }}
    }}
    return result;
}}

int parseIntVal(const string& input, const string& key) {{
    regex r(key + "\\\\s*=\\\\s*(-?\\\\d+)");
    smatch m;
    if (regex_search(input, m, r)) return stoi(m[1]);
    return 0;
}}

string extractArray(const string& input, const string& key) {{
    regex r(key + "\\\\s*=\\\\s*\\\\[([^\\\\]]*)\\\\]");
    smatch m;
    if (regex_search(input, m, r)) return "[" + m[1].str() + "]";
    return "[]";
}}

int main() {{
    string input;
    char ch;
    while (cin.get(ch)) {{ input += ch; }}

    Solution sol;

    string numsStr = extractArray(input, "nums");
    if (numsStr == "[]") numsStr = extractArray(input, "arr");
    if (numsStr == "[]") numsStr = extractArray(input, "a");

    vector<int> nums = parseIntArray(numsStr);
    int k = parseIntVal(input, "k");
    int target = parseIntVal(input, "target");

    try {{
        auto result = {call_expr};
        cout << "\\n===RESULT===\\n" << result << endl;
        return 0;
    }} catch (...) {{}}

    cout << "\\n===RESULT===\\n-1" << endl;
    return 0;
}}
"""

def parse_execution_stdout(raw_stdout: str):
    """Splits raw stdout into (user_stdout, actual_output) using ===RESULT=== delimiter."""
    if not raw_stdout:
        return "", ""
    if "===RESULT===" in raw_stdout:
        parts = raw_stdout.split("===RESULT===")
        user_stdout = parts[0].strip()
        actual_output = parts[1].strip()
    else:
        user_stdout = ""
        actual_output = raw_stdout.strip()
    return user_stdout, actual_output

def normalize_output(s: str) -> str:
    if s is None:
        return ""
    s = s.strip()
    s = re.sub(r'\[\s+', '[', s)
    s = re.sub(r'\s+\]', ']', s)
    s = re.sub(r'\s*,\s*', ',', s)
    if s.lower() == "true":
        return "true"
    if s.lower() == "false":
        return "false"
    return s

import subprocess, tempfile, sys, shutil

def execute_python_natively(code: str, test_input: str, time_limit: float = 2.0):
    python_binary = sys.executable or shutil.which("python3") or shutil.which("python")
    driver = HIDDEN_DRIVERS.get("python", "")
    full_code = f"{code}\n\n{driver}"

    with tempfile.TemporaryDirectory() as tmpdir:
        py_file = os.path.join(tmpdir, "solution.py")
        with open(py_file, "w", encoding="utf-8") as f:
            f.write(full_code)

        try:
            proc = subprocess.run(
                [python_binary, py_file],
                input=test_input,
                capture_output=True, text=True, timeout=min(time_limit, 2.0)
            )
            return {"run": {"stderr": proc.stderr, "stdout": proc.stdout, "signal": None}}
        except subprocess.TimeoutExpired:
            return {"run": {"stderr": "Time Limit Exceeded", "stdout": "", "signal": "SIGKILL"}}
        except Exception as e:
            return {"run": {"stderr": f"Execution Exception: {e}", "stdout": "", "signal": "SIGABRT"}}


import glob

def find_cpp_binary():
    """Finds g++ path by checking system PATH and standard MinGW/MSYS2 installation folders."""
    gpp_path = shutil.which("g++")
    if gpp_path:
        return gpp_path
        
    if os.name == "nt":
        search_dirs = [
            "C:\\MinGW\\bin\\g++.exe",
            "C:\\msys64\\mingw64\\bin\\g++.exe",
            "C:\\msys64\\ucrt64\\bin\\g++.exe",
            "C:\\Program Files\\mingw-w64\\**\\bin\\g++.exe"
        ]
        for path in search_dirs:
            if "**" in path:
                matches = glob.glob(path, recursive=True)
                if matches:
                    return matches[0]
            elif os.path.exists(path):
                return path
    return None

def find_java_binaries():
    """Finds javac and java paths by checking system PATH and standard Windows/Linux installation folders."""
    javac_path = shutil.which("javac")
    java_path = shutil.which("java")
    
    if javac_path and java_path:
        return javac_path, java_path
        
    if os.name == "nt":
        search_dirs = [
            "C:\\Program Files\\Eclipse Adoptium\\**\\bin",
            "C:\\Program Files\\Java\\**\\bin",
            "C:\\Program Files (x86)\\Java\\**\\bin",
            "C:\\Program Files\\Microsoft\\**\\bin"
        ]
        
        for s_dir in search_dirs:
            matches = glob.glob(os.path.join(s_dir, "javac.exe"), recursive=True)
            if matches:
                cand_javac = matches[0]
                cand_java = cand_javac.replace("javac.exe", "java.exe")
                if os.path.exists(cand_java):
                    return cand_javac, cand_java
                    
    return None, None


def execute_cpp_natively(code: str, test_input: str, time_limit: float = 2.0):
    gpp_binary = find_cpp_binary()
    if not gpp_binary:
        return {"run": {"stderr": "C++ GCC compiler (g++) is not installed on local machine. Use Python for local testing.", "stdout": "", "signal": None}}

    driver = build_cpp_driver(code)
    cpp_headers = """#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <sstream>
#include <regex>
using namespace std;
"""
    full_code = f"{cpp_headers}\n\n{code}\n\n{driver}"

    with tempfile.TemporaryDirectory() as tmpdir:
        src_file = os.path.join(tmpdir, "solution.cpp")
        exe_file = os.path.join(tmpdir, "solution.exe" if os.name == "nt" else "solution")

        with open(src_file, "w", encoding="utf-8") as f:
            f.write(full_code)

        # 1. Compile with g++ -O2
        try:
            comp = subprocess.run(
                [gpp_binary, "-O2", src_file, "-o", exe_file],
                capture_output=True, text=True, timeout=10.0
            )
            if comp.returncode != 0:
                return {"run": {"stderr": comp.stderr, "stdout": "", "signal": None}}
        except Exception as e:
            return {"run": {"stderr": f"Compilation Exception: {e}", "stdout": "", "signal": None}}

        # 2. Execute binary with strict timeout
        try:
            proc = subprocess.run(
                [exe_file],
                input=test_input,
                capture_output=True, text=True, timeout=min(time_limit, 2.0)
            )
            return {"run": {"stderr": proc.stderr, "stdout": proc.stdout, "signal": None}}
        except subprocess.TimeoutExpired:
            return {"run": {"stderr": "Time Limit Exceeded", "stdout": "", "signal": "SIGKILL"}}
        except Exception as e:
            return {"run": {"stderr": f"Execution Exception: {e}", "stdout": "", "signal": "SIGABRT"}}


def execute_java_natively(code: str, test_input: str, time_limit: float = 2.0):
    javac_binary, java_binary = find_java_binaries()
    if not javac_binary or not java_binary:
        return {"run": {"stderr": "Java JDK is not installed on local machine. Use Python or C++ for local testing.", "stdout": "", "signal": None}}

    driver = HIDDEN_DRIVERS.get("java", "")
    java_imports = """import java.util.*;
import java.lang.reflect.*;
import java.util.regex.*;
import java.io.*;
import java.math.*;
"""
    clean_driver = driver.replace("import java.util.*;", "") \
                         .replace("import java.lang.reflect.*;", "") \
                         .replace("import java.util.regex.*;", "")
    full_code = f"{java_imports}\n\n{code}\n\n{clean_driver}"

    with tempfile.TemporaryDirectory() as tmpdir:
        java_file = os.path.join(tmpdir, "HiddenRunner.java")
        with open(java_file, "w", encoding="utf-8") as f:
            f.write(full_code)

        # 1. Compile with javac
        try:
            comp = subprocess.run(
                [javac_binary, java_file],
                capture_output=True, text=True, timeout=10.0
            )
            if comp.returncode != 0:
                return {"run": {"stderr": comp.stderr, "stdout": "", "signal": None}}
        except Exception as e:
            return {"run": {"stderr": f"Compilation Exception: {e}", "stdout": "", "signal": None}}

        # 2. Execute with java
        try:
            proc = subprocess.run(
                [java_binary, "-cp", tmpdir, "HiddenRunner"],
                input=test_input,
                capture_output=True, text=True, timeout=min(time_limit, 2.0)
            )
            return {"run": {"stderr": proc.stderr, "stdout": proc.stdout, "signal": None}}
        except subprocess.TimeoutExpired:
            return {"run": {"stderr": "Time Limit Exceeded", "stdout": "", "signal": "SIGKILL"}}
        except Exception as e:
            return {"run": {"stderr": f"Execution Exception: {e}", "stdout": "", "signal": "SIGABRT"}}


def execute_code_natively(code: str, language: str, test_input: str, time_limit: float = 2.0):
    lang = language.lower()
    if lang in ("cpp", "c++"):
        return execute_cpp_natively(code, test_input, time_limit)
    elif lang in ("python", "py"):
        return execute_python_natively(code, test_input, time_limit)
    elif lang in ("java",):
        return execute_java_natively(code, test_input, time_limit)
    else:
        return {"run": {"stderr": f"Unsupported language: {language}", "stdout": "", "signal": None}}

# Endpoint 1: GET ALL PROBLEMS
@app.get("/api/problems")
def get_problems(db: Session = Depends(get_db)):
    problems = db.query(models.Problem).all()
    if not problems:
        return [{
            "id": 1,
            "problem_code": "001",
            "title": "Two Sum",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            "difficulty": "Easy",
            "topic": "Arrays",
            "tags": ["Arrays", "Hash Table"],
            "companies": ["Google", "Amazon", "Meta", "Microsoft"],
            "hints": [
                "A brute force approach checks all pairs in O(N^2) time. Can we do better with space?",
                "Can a Hash Table help look up complements in O(1) time?"
            ],
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9"
            ],
            "expected_time_complexity": "$O(N)$",
            "expected_space_complexity": "$O(N)$",
            "time_limit": 1.0,
            "memory_limit": 256,
            "supported_languages": ["python", "cpp", "java"],
            "starter_code": {
                "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass"
            },
            "sample_test_cases": [
                {"input": "nums = [2,7,11,15], target = 9", "expected": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."},
                {"input": "nums = [3,2,4], target = 6", "expected": "[1, 2]", "explanation": "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."}
            ]
        }]
    return problems

# Endpoint 2: GENERATE NEW AI PROBLEM DYNAMICALLY USING GEMINI
@app.post("/api/generate-problem")
async def generate_problem(request: dict, db: Session = Depends(get_db)):
    topic = request.get("topic", "Arrays")
    difficulty = request.get("difficulty", "Medium")

    api_key = os.getenv("GEMINI_API_KEY_DATABASE_SEEDING") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="GEMINI_API_KEY_DATABASE_SEEDING is not set in backend .env")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        model = None
        for m_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(m_name)
                break
            except Exception:
                continue

        if not model:
            model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""Generate a 100% original, unique interview-level Data Structures & Algorithms coding problem for topic '{topic}' with difficulty '{difficulty}'.

Return ONLY a valid JSON object matching this exact schema without markdown formatting:
{{
  "title": "Problem Title",
  "difficulty": "{difficulty}",
  "topic": "{topic}",
  "tags": ["{topic}"],
  "companies": ["Google", "Amazon", "Meta"],
  "description": "Clear, detailed problem description with story and requirements.",
  "constraints": ["$1 \\le N \\le 10^5$"],
  "hints": ["Hint 1 text", "Hint 2 text"],
  "expected_time_complexity": "$O(N)$",
  "expected_space_complexity": "$O(1)$",
  "time_limit": 1.0,
  "memory_limit": 256,
  "supported_languages": ["python", "cpp", "java"],
  "starter_code": {{
    "python": "class Solution:\\n    def solve(self):\\n        pass",
    "cpp": "class Solution {{\\npublic:\\n    void solve() {{\\n    }}\\n}};",
    "java": "class Solution {{\\n    public void solve() {{\\n    }}\\n}}"
  }},
  "optimal_solution_python": "class Solution:\\n    def solve(self):\\n        # complete working solution code",
  "optimal_solution_cpp": "class Solution {{\\npublic:\\n    void solve() {{\\n        // complete working solution code\\n    }}\\n}};",
  "optimal_solution_java": "class Solution {{\\n    public void solve() {{\\n        // complete working solution code\\n    }}\\n}}",
  "sample_test_cases": [
    {{
      "input": "sample input string",
      "expected": "sample expected output",
      "explanation": "Detailed step-by-step explanation"
    }}
  ],
  "dry_run_steps": [
    {{
      "step": 1,
      "title": "Initialize variables",
      "explanation": "Explanation of step 1",
      "variables": {{ "index": 0 }}
    }}
  ]
}}"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        problem_data = json.loads(raw_text)

        # Save to database
        new_p = models.Problem(
            problem_code=str(problem_data.get("problem_id", "")),
            title=problem_data.get("title", f"AI Generated {topic} Problem"),
            description=problem_data.get("description", ""),
            difficulty=problem_data.get("difficulty", difficulty),
            topic=problem_data.get("topic", topic),
            tags=problem_data.get("tags", [topic]),
            companies=problem_data.get("companies", ["Google", "Meta"]),
            hints=problem_data.get("hints", []),
            constraints=problem_data.get("constraints", []),
            expected_time_complexity=problem_data.get("expected_time_complexity", "$O(N)$"),
            expected_space_complexity=problem_data.get("expected_space_complexity", "$O(1)$"),
            time_limit=float(problem_data.get("time_limit", 1.0)),
            memory_limit=int(problem_data.get("memory_limit", 256)),
            supported_languages=problem_data.get("supported_languages", ["python", "cpp", "java"]),
            starter_code=problem_data.get("starter_code", {}),
            sample_test_cases=problem_data.get("sample_test_cases", []),
            hidden_test_cases=problem_data.get("sample_test_cases", []),
            dry_run_steps=problem_data.get("dry_run_steps", []),
            optimal_solution_python=problem_data.get("optimal_solution_python"),
            optimal_solution_cpp=problem_data.get("optimal_solution_cpp"),
            optimal_solution_java=problem_data.get("optimal_solution_java")
        )

        db.add(new_p)
        db.commit()
        db.refresh(new_p)

        return {
            "id": new_p.id,
            "problem_code": new_p.problem_code or str(new_p.id),
            "title": new_p.title,
            "description": new_p.description,
            "difficulty": new_p.difficulty,
            "topic": new_p.topic,
            "tags": new_p.tags,
            "companies": new_p.companies,
            "hints": new_p.hints,
            "constraints": new_p.constraints,
            "expected_time_complexity": new_p.expected_time_complexity,
            "expected_space_complexity": new_p.expected_space_complexity,
            "time_limit": new_p.time_limit,
            "memory_limit": new_p.memory_limit,
            "supported_languages": new_p.supported_languages,
            "starter_code": new_p.starter_code,
            "sample_test_cases": new_p.sample_test_cases,
            "dry_run_steps": new_p.dry_run_steps
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate problem via AI: {str(e)}")

# Endpoint 3: RUN CODE NATIVELY
@app.post("/api/run")
def run_code(execution: schemas.CodeExecution, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == execution.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    test_cases_to_run = []
    if execution.custom_inputs and len(execution.custom_inputs) > 0:
        for idx, input_str in enumerate(execution.custom_inputs):
            matching_expected = ""
            sample_cases = problem.sample_test_cases or []
            
            # 1. Try matching with predefined sample case input exactly
            matching_tc = next((tc for tc in sample_cases if tc.get("input", "").strip() == input_str.strip()), None)
            if matching_tc:
                matching_expected = matching_tc.get("expected", "")
            else:
                # 2. Compute dynamic expected answer using language-matched reference solution
                lang = execution.language.lower()
                ref_solution = None
                if lang == "python":
                    ref_solution = problem.optimal_solution_python
                elif lang == "cpp":
                    ref_solution = problem.optimal_solution_cpp
                elif lang == "java":
                    ref_solution = problem.optimal_solution_java
                
                if ref_solution:
                    try:
                        ref_data = execute_code_natively(ref_solution, lang, input_str, 2.0)
                        ref_run = ref_data.get("run", {})
                        ref_stdout = ref_run.get("stdout", "")
                        _, ref_expected = parse_execution_stdout(ref_stdout)
                        ref_expected = ref_expected.strip()
                        if ref_expected:
                            matching_expected = ref_expected
                        else:
                            matching_expected = "N/A (Reference returned empty)"
                    except Exception as e:
                        matching_expected = f"N/A (Reference Exception: {str(e)})"
                else:
                    matching_expected = "N/A (Custom Test Case)"
            
            test_cases_to_run.append({
                "input": input_str,
                "expected": matching_expected
            })
    else:
        test_cases_to_run = problem.sample_test_cases or []

    results = []
    all_passed = True
    overall_status = "Accepted"

    for index, test in enumerate(test_cases_to_run):
        try:
            data = execute_code_natively(
                execution.code, execution.language, 
                test["input"], 2.0
            )
            
            run_data = data.get("run", {})
            raw_stdout = run_data.get("stdout", "")
            stderr_output = run_data.get("stderr", "").strip()
            exec_signal = run_data.get("signal")

            user_stdout, actual_output = parse_execution_stdout(raw_stdout)

            if exec_signal == "SIGKILL":
                case_status = "Time Limit Exceeded"
                all_passed = False
                if overall_status == "Accepted":
                    overall_status = "Time Limit Exceeded"
            elif exec_signal:
                case_status = "Runtime Error"
                all_passed = False
                if overall_status == "Accepted":
                    overall_status = "Runtime Error"
            elif stderr_output:
                case_status = "Compile Error" if "error" in stderr_output.lower() or "not installed" in stderr_output.lower() else "Runtime Error"
                all_passed = False
                if overall_status == "Accepted":
                    overall_status = case_status
            else:
                exp_norm = normalize_output(test.get("expected", ""))
                act_norm = normalize_output(actual_output)
                if exp_norm and act_norm == exp_norm:
                    case_status = "Passed"
                elif not exp_norm:
                    case_status = "Executed"
                else:
                    case_status = "Wrong Answer"
                    all_passed = False
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"

            results.append({
                "case": index + 1,
                "status": case_status,
                "input": test["input"],
                "expected": test.get("expected", ""),
                "actual": actual_output if case_status not in ("Compile Error", "Runtime Error") else "",
                "stdout": user_stdout,
                "error": stderr_output if stderr_output else None
            })
        except Exception as e:
            results.append({
                "case": index + 1,
                "status": "Runtime Error",
                "input": test["input"],
                "expected": test.get("expected", ""),
                "actual": "",
                "stdout": "",
                "error": str(e)
            })
            all_passed = False
            overall_status = "Runtime Error"

    passed_count = sum(1 for r in results if r["status"] in ("Passed", "Executed"))
    return {
        "status": "Accepted" if all_passed else overall_status,
        "message": f"Passed {passed_count}/{len(results)} Testcases" if not all_passed else f"All {len(results)} Sample Testcases Passed!",
        "total_passed": passed_count,
        "total_cases": len(results),
        "results": results
    }

# Endpoint 4: SUBMIT CODE NATIVELY
@app.post("/api/submit")
def submit_code(submission: schemas.CodeSubmission, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    all_test_cases = (problem.sample_test_cases or []) + (problem.hidden_test_cases or [])
    results = []
    
    for index, test in enumerate(all_test_cases):
        try:
            data = execute_code_natively(
                submission.code, submission.language, 
                test["input"], 2.0
            )
            
            run_data = data.get("run", {})
            raw_stdout = run_data.get("stdout", "")
            error_output = run_data.get("stderr", "").strip()
            exec_signal = run_data.get("signal")

            user_stdout, actual_output = parse_execution_stdout(raw_stdout)

            if exec_signal == "SIGKILL":
                return {
                    "status": "Time Limit Exceeded",
                    "failed_case": index + 1,
                    "total_passed": index,
                    "total_cases": len(all_test_cases),
                    "message": f"Time Limit Exceeded on Test Case {index + 1}"
                }
            elif exec_signal:
                return {
                    "status": "Runtime Error",
                    "failed_case": index + 1,
                    "total_passed": index,
                    "total_cases": len(all_test_cases),
                    "message": f"Runtime Error on Test Case {index + 1}",
                    "error": f"Process terminated (Signal {exec_signal})"
                }

            if error_output:
                return {
                    "status": "Compile Error",
                    "failed_case": index + 1,
                    "total_passed": index,
                    "total_cases": len(all_test_cases),
                    "message": "Compilation / Syntax Error",
                    "error": error_output
                }
            
            exp_norm = normalize_output(test.get("expected", ""))
            act_norm = normalize_output(actual_output)

            if exp_norm and act_norm == exp_norm:
                results.append({"case": index + 1, "status": "Passed"})
            else:
                return {
                    "status": "Wrong Answer",
                    "failed_case": index + 1,
                    "total_passed": len(results),
                    "total_cases": len(all_test_cases),
                    "input": test["input"],
                    "expected": test.get("expected", ""),
                    "actual": actual_output,
                    "stdout": user_stdout,
                    "message": f"Wrong Answer on Test Case {index + 1}"
                }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

    return {
        "status": "Accepted",
        "total_passed": len(all_test_cases),
        "total_cases": len(all_test_cases),
        "message": f"Accepted! Passed all {len(all_test_cases)} hidden test cases."
    }

# Endpoint 5: SOCRATIC AI COACH
@app.post("/api/coach")
async def chat_with_coach(request: schemas.CoachRequest, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == request.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    from fastapi.responses import StreamingResponse
    import ai_coach

    return StreamingResponse(
        ai_coach.stream_coach_response(
            problem=problem,
            code=request.code,
            language=request.language,
            chat_history=request.chat_history,
            console_output=request.console_output
        ),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)