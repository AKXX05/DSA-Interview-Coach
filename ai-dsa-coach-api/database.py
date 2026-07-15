import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

DATABASE_URL = "postgresql://postgres.umxiaynopydxrfsaxwhw:myProjects_myThoughts@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Helper function to open/close database connections automatically
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()