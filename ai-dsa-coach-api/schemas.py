from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Input Schema for code execution
class CodeSubmission(BaseModel):
    problem_id: int
    code: str
    language: str

# Secure Output Schema (Hides "hidden_test_cases")
class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    tags: List[str]
    companies: Optional[List[str]] = []
    hints: Optional[List[str]] = []
    constraints: Optional[List[str]] = []
    time_limit: float
    memory_limit: int
    supported_languages: List[str]
    starter_code: Dict[str, str]
    sample_test_cases: List[Dict[str, Any]] # Visible to frontend not hidden_test_cases
    created_at: datetime

    class Config:
        # Pydantic v2: use from_attributes = True
        # Pydantic v1: use orm_mode = True
        from_attributes = True