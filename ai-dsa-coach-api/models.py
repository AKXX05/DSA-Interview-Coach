from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    difficulty = Column(String, nullable=False) # Maps to our SQL Enum type
    
    # Categorization
    tags = Column(JSON, nullable=False)
    companies = Column(JSON, default=[])
    
    # Problem Details
    hints = Column(JSON, default=[])
    constraints = Column(JSON, default=[])
    
    # Execution Constraints
    time_limit = Column(Float, default=2.0)     # In seconds (e.g., 2.0s)
    memory_limit = Column(Integer, default=256) # In megabytes (e.g., 256MB)
    
    # Code Execution Data
    supported_languages = Column(JSON, default=["python", "cpp", "java"])
    starter_code = Column(JSON, nullable=False)
    
    # Test Cases (Split into Sample vs Hidden)
    sample_test_cases = Column(JSON, nullable=False) # Runs on "Run Code"
    hidden_test_cases = Column(JSON, nullable=False) # Runs on "Submit"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())