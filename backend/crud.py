"""
CRUD Operations Module

This module abstracts database interactions for Tasks.
It provides functions to:
1.  Create a new task.
2.  Read tasks (all or single).
3.  Update a task.
4.  Delete a task.
"""

from sqlmodel import Session, select
from models import Task, TaskStatus, User, TaskCreate, TaskUpdate
from typing import Optional

def create_task(session: Session, task_in: TaskCreate) -> Task:
    """
    Create a new task record in the database.
    """
    task = Task.from_orm(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def get_task(session: Session, task_id: int) -> Task | None:
    """
    Retrieve a single task by its ID.
    Returns None if not found.
    """
    return session.get(Task, task_id)

def update_task(session: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """
    Update an existing task record in the database.
    """
    db_task = session.get(Task, task_id)
    if not db_task:
        return None
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

def get_tasks(session: Session, offset: int = 0, limit: int = 100):
    """
    Retrieve a list of tasks with pagination support.
    """
    return session.exec(select(Task).offset(offset).limit(limit)).all()

def delete_task(session: Session, task_id: int) -> Task | None:
    """
    Delete a task by ID.
    """
    task = session.get(Task, task_id)
    if task:
        session.delete(task)
        session.commit()
    return task

def create_user(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_users(session: Session):
    return session.exec(select(User)).all()
