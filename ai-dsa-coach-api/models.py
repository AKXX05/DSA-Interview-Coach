from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    problem_code = Column(String(50), nullable=True) # E.g. "001"
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    
    # Categorization
    topic = Column(String(100), nullable=True)
    tags = Column(JSONB, nullable=False)
    companies = Column(JSONB, default=[]) # asked_by companies
    
    # Problem Details & LaTeX Complexities
    hints = Column(JSONB, default=[])
    constraints = Column(JSONB, default=[])
    expected_time_complexity = Column(String, nullable=True) # e.g. "$O(N)$"
    expected_space_complexity = Column(String, nullable=True) # e.g. "$O(1)$"
    
    # Execution Constraints
    time_limit = Column(Float, default=2.0)     # In seconds
    memory_limit = Column(Integer, default=256) # In MB
    
    # Code Execution Data
    supported_languages = Column(JSONB, default=["python", "cpp", "java"])
    starter_code = Column(JSONB, nullable=False)
    
    # Test Cases & Dry Run Steps
    sample_test_cases = Column(JSONB, nullable=False) # examples
    hidden_test_cases = Column(JSONB, nullable=False) # hidden cases
    dry_run_steps = Column(JSONB, default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())