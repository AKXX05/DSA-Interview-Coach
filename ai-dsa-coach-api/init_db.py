import sys
from database import engine, Base
import models

def init_database():
    print("Connecting to database and creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Failed to create database tables: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    init_database()
