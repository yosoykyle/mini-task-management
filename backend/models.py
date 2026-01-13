"""
Data Models Module

This file defines the "Shape" or "Blueprint" of our data.

We use **SQLModel**, which combines two things:
1.  **Database Tables**: How the data looks inside the SQL database (columns, types).
2.  **Data Validation**: Like a bouncer at a club, checking if the data coming in is valid (e.g., ensuring email is actually an email).
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class TaskStatus(str, Enum):
    """
    Enum for Task Status.
    This limits the values to ONLY these options.
    You can't set status to "Cooking" or "Eating", only what's listed here.
    """
    TODO = "Todos"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
    FOR_TESTING = "For Testing"
    DEPLOYMENT = "Deployment"

class User(SQLModel, table=True):
    """
    User Database Table.
    
    This creates a table named 'user' in the database with these columns.
    """
    id: Optional[int] = Field(default=None, primary_key=True, description="Unique identifier for the user.")
    username: str = Field(index=True, unique=True, description="Unique username for login.")
    email: str = Field(description="Email address of the user.")

class TaskBase(SQLModel):
    """
    Base Model (The Common Ground).
    
    This class holds the fields that are SHARED between:
    - The Database Table
    - The "Create Task" form
    - The "Read Task" output
    """
    title: str = Field(description="Title of the task.")
    description: Optional[str] = Field(default=None, description="Detailed description of the task.")
    status: TaskStatus = Field(default=TaskStatus.TODO, description="Current status of the task.")

class Task(TaskBase, table=True):
    """
    The Actual Database Table ('task').
    
    Inherits fields from TaskBase (title, description, status)
    AND adds fields that only the DB handles (id, created_at, updated_at).
    """
    id: Optional[int] = Field(default=None, primary_key=True, description="Unique identifier for the task.")
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id", description="ID of the user assigned to this task.")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the task was created.")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the task was last updated.")

class TaskCreate(TaskBase):
    """
    The "Registration Form".
    
    This is the data we expect the USER to send us when creating a task.
    We don't ask them for an ID or Created Date; the system handles that.
    """
    pass

class TaskRead(TaskBase):
    """
    The "Receipt" or "Public View".
    
    When a user asks to SEE a task, we give them this.
    It includes everything in the Base, PLUS the ID and timestamps that the DB generated.
    """
    id: int = Field(description="Unique identifier for the task.")
    assignee_id: Optional[int] = Field(default=None, description="ID of the user assigned to this task.")
    created_at: datetime = Field(description="Timestamp when the task was created.")
    updated_at: datetime = Field(description="Timestamp when the task was last updated.")

class TaskUpdate(SQLModel):
    """
    The "Edit Form".
    
    Used when updating a task. Everything is OPTIONAL here.
    Why? Because the user might only want to change the Title, but leave the Description alone.
    """
    title: Optional[str] = Field(default=None, description="New title for the task.")
    description: Optional[str] = Field(default=None, description="New detailed description for the task.")
    status: Optional[TaskStatus] = Field(default=None, description="New status for the task.")
    assignee_id: Optional[int] = Field(default=None, description="New assignee ID for the task.")
