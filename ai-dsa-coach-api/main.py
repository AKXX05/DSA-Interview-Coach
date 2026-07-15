from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import httpx

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

LANGUAGE_MAP = {
    "python": "python",
    "cpp": "c++",
    "java": "java"
}

HIDDEN_DRIVERS = {
        "python": """
    # Hidden Code Starts Here
    import sys, json

    if __name__ == '__main__':
        # Here we will write logic to parse sys.stdin, 
        # call twoSum(), and print the result.
    """,
        "cpp": """
    // Hidden Code Starts Here
    int main() {
        // Here we will read cin, parse the string to vectors,
        // call Solution().twoSum(), and print the result.
        return 0;
    }
    """ 
}

# Helper function to send code to Piston and handle limits
async def execute_on_piston(client: httpx.AsyncClient, code: str, language: str, stdin: str, time_limit: float, memory_limit: int):
    # Piston expects milliseconds for timeout, and bytes for memory limit
    run_timeout_ms = int(time_limit * 1000)
    run_memory_bytes = int(memory_limit * 1024 * 1024)

    # Combine user code + hidden driver code
    driver_code = HIDDEN_DRIVERS.get(language, "")
    full_execution_code = f"{code}\n\n{driver_code}"

    payload = {
        "language": LANGUAGE_MAP[language],
        "version": "*",
        "files": [{"content": full_execution_code}],
        "stdin": stdin,
        "run_timeout": run_timeout_ms,
        "run_memory_limit": run_memory_bytes
    }
    
    response = await client.post("http://127.0.0.1:2000/api/v2/execute", json=payload)
    response.raise_for_status()
    return response.json()

@app.get("/api/problems", response_model=List[schemas.ProblemResponse])
def fetch_all_problems(db: Session = Depends(get_db)):
    return db.query(models.Problem).all()

# Endpoint 1: RUN CODE (Runs only visible sample cases)
@app.post("/api/run")
async def run_code(submission: schemas.CodeSubmission, db: Session = Depends(get_db)):
    if submission.language not in LANGUAGE_MAP:
        raise HTTPException(status_code=400, detail="Unsupported language")

    db_problem = db.query(models.Problem).filter(models.Problem.id == submission.problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    


    results = []
    
    async with httpx.AsyncClient() as client:
        # Loop ONLY through the sample test cases
        for index, test in enumerate(problem.sample_test_cases):
            try:
                data = await execute_on_piston(
                    client, submission.code, submission.language, 
                    test["input"], problem.time_limit, problem.memory_limit
                )
                
                run_data = data.get("run", {})
                actual_output = run_data.get("stdout", "").strip()
                error_output = run_data.get("stderr", "").strip()
                piston_signal = run_data.get("signal")

                # Handle Time Out (Killed by SIGKILL) or Out of Memory
                if piston_signal == "SIGKILL":
                    return {"status": "Time Limit Exceeded", "failed_case": index + 1}
                elif piston_signal:
                    return {"status": "Runtime Error", "message": f"Process terminated (Signal {piston_signal})", "failed_case": index + 1}

                if error_output:
                    return {"status": "Compilation Error", "message": error_output, "failed_case": index + 1}
                
                # Check answers
                if actual_output == test["expected"].strip():
                    results.append({"case": index + 1, "status": "Passed"})
                else:
                    return {
                        "status": "Failed",
                        "failed_case": index + 1,
                        "input": test["input"],
                        "expected": test["expected"],
                        "actual": actual_output
                    }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

    return {"status": "Success", "total_passed": len(problem.sample_test_cases), "results": results}


# Endpoint 2: SUBMIT CODE (Runs both Sample AND Hidden cases)
@app.post("/api/submit")
async def submit_code(submission: schemas.CodeSubmission, db: Session = Depends(get_db)):
    if submission.language not in LANGUAGE_MAP:
        raise HTTPException(status_code=400, detail="Unsupported language")

    problem = db.query(models.Problem).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Merge sample and hidden test cases together for final validation
    all_test_cases = problem.sample_test_cases + problem.hidden_test_cases
    results = []
    
    async with httpx.AsyncClient() as client:
        for index, test in enumerate(all_test_cases):
            try:
                data = await execute_on_piston(
                    client, submission.code, submission.language, 
                    test["input"], problem.time_limit, problem.memory_limit
                )
                
                run_data = data.get("run", {})
                actual_output = run_data.get("stdout", "").strip()
                error_output = run_data.get("stderr", "").strip()
                piston_signal = run_data.get("signal")

                if piston_signal == "SIGKILL":
                    return {"status": "Time Limit Exceeded", "failed_case": index + 1}
                elif piston_signal:
                    return {"status": "Runtime Error", "message": f"Process terminated", "failed_case": index + 1}

                if error_output:
                    return {"status": "Compilation Error", "message": error_output, "failed_case": index + 1}
                
                if actual_output == test["expected"].strip():
                    results.append({"case": index + 1, "status": "Passed"})
                else:
                    # Secret details are omitted on submission failure to prevent testing exploits!
                    return {
                        "status": "Wrong Answer",
                        "failed_case": index + 1
                    }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

    return {"status": "Accepted", "total_passed": len(all_test_cases), "results": results}