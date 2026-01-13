"""
CRUD Operations Module

CRUD stands for:
- **C**reate
- **R**ead
- **U**pdate
- **D**elete

This module contains the "Heavy Lifting" functions that actually talk to the database.
The API (main.py) calls these functions so it doesn't have to write raw SQL commands itself.
"""

from sqlmodel import Session, select
from models import Task, TaskStatus, User, TaskCreate, TaskUpdate
from typing import Optional

def create_task(session: Session, task_in: TaskCreate) -> Task:
    """
    Create a new task record in the database.
    
    Analogy: Filling out a customized form and processing it.
    
    Steps:
    1. `Task.from_orm(task_in)`: Converts the simple input data into a full Database Object.
    2. `session.add(task)`: Tells the DB session "I want to save this new thing."
    3. `session.commit()`: The "Save" button. Actually writes the data to the hard drive/DB.
    4. `session.refresh(task)`: Re-loads the data from the DB to get generated fields (like the new ID).
    """
    task = Task.from_orm(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def get_task(session: Session, task_id: int) -> Task | None:
    """
    Retrieve a single task by its ID.
    
    Analogy: Looking up a specific file in a cabinet by its label number.
    Returns `None` if the file isn't there.
    """
    return session.get(Task, task_id)

def update_task(session: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """
    Update an existing task record.
    
    Analogy: Taking an existing file, crossing out old info, and writing new info.
    
    Steps:
    1. Find the task. If missing, stop.
    2. Loop through the update data and change only the fields that were provided.
    3. Save the changes (`commit`).
    4. Refresh the object to make sure we have the latest version.
    """
    db_task = session.get(Task, task_id)
    if not db_task:
        return None
        
    # Only update fields that were actually sent (exclude_unset=True)
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

def get_tasks(session: Session, offset: int = 0, limit: int = 100):
    """
    Retrieve a list of tasks.
    
    Analogy: "Give me the next 100 files starting from file #0."
    This prevents the system from crashing if we ask for ALL files at once.
    """
    return session.exec(select(Task).offset(offset).limit(limit)).all()

def delete_task(session: Session, task_id: int) -> Task | None:
    """
    Delete a task by ID.
    
    Analogy: Shredding a specific file.
    """
    task = session.get(Task, task_id)
    if task:
        session.delete(task)
        session.commit() # Don't forget to push the "Delete" button!
    return task

def create_user(session: Session, user: User) -> User:
    """
    Create a new user. Similar logic to create_task.
    """
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_users(session: Session):
    """
    Get all users.
    """
    return session.exec(select(User)).all()
