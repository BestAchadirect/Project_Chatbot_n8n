from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Read from .env or fallback to Docker default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/testdb")

# Show which database you're connecting to
print(f"[INFO] Connecting to database: {DATABASE_URL}")

# Initialize SQLAlchemy
Base = declarative_base()
try:
    engine = create_engine(DATABASE_URL, echo=False, future=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    # Optional: test the connection
    with engine.connect() as conn:
        print("[SUCCESS] Database connection successful.")
except OperationalError as e:
    print(f"[ERROR] Failed to connect to the database: {e}")
    raise
