from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
from typing import Generator

# --- Load Environment Variables ---
load_dotenv()

# --- Database Connection URL ---
# Get DB URL from .env or default to local sqlite (though MySQL is expected)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+mysqlconnector://root:password@localhost:3306/task_db")

# --- Create Engine ---
# The engine is the central point of connection to the database
engine = create_engine(DATABASE_URL, echo=True)  # echo=True logs SQL queries for debugging

def create_db_and_tables():
    """
    Initialize database tables based on SQLModel metadata.
    Call this on application startup.
    """
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency generator for FastAPI.
    Yields a database session for a single request and closes it afterwards.
    """
    with Session(engine) as session:
        yield session
