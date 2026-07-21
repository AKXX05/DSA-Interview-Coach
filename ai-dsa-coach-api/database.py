import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

# Load standard .env first, then fall back to connection.env if DATABASE_URL is not set
load_dotenv()
if not os.getenv("DATABASE_URL"):
    load_dotenv("connection.env")

DATABASE_URL = os.getenv("DATABASE_URL")

# Supabase recommends NullPool when connecting via transaction poolers.
# Also, enforce sslmode=require for secure connections to cloud databases.
connect_args = {}
if DATABASE_URL and "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL:
    connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Helper function to open/close database connections automatically
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()