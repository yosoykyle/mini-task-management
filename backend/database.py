"""
Database Connection Module

This module handles the "Plumbing" to connect our Python code to the Database.

It sets up two main things:
1.  **Engine**: The main cable plugged into the database.
2.  **Session**: A temporary workspace to do work (like a single conversation).
"""

from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
from typing import Generator

# --- Load Environment Variables ---
# This looks for a .env file and loads the secret passwords/settings so we don't hardcode them.
load_dotenv()

# --- Database Connection URL ---
# This is the "Address" of the database.
# Format: database_type+driver://username:password@host:port/database_name
# Example: mysql+mysqlconnector://root:password@localhost:3306/task_db
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+mysqlconnector://root:password@localhost:3306/task_db")

# --- Create Engine ---
# The engine is the "Factory" that creates connections.
# echo=True means "Print every SQL command to the screen" (Great for debugging/learning!)
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """
    Setup Function.
    
    Checks the 'models.py' file for any classes with table=True.
    Then, it tells the database: "Make sure these tables exist!"
    """
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """
    Session Provider.
    
    This is used by the API to give each request its own private workspace.
    
    Flow:
    1.  Open a new session.
    2.  Give it to the function that needs it (yield).
    3.  When the function is done, close the session automatically (cleanup).
    """
    with Session(engine) as session:
        yield session
