"""
Main FastAPI Application Module

This module serves as the entry point for the backend application.
It handles:
1.  FastAPI app initialization and middleware setup (CORS).
2.  Lifespan management for database, Kafka producer, and consumer.
3.  WebSocket connections for real-time updates.
4.  REST API endpoints for tasks and users included via routers (if split) or directly here.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import json
import asyncio

from database import create_db_and_tables, get_session
from models import Task, TaskCreate, TaskUpdate, TaskRead, User
from crud import create_task, get_tasks, get_task, update_task, delete_task, create_user, get_users
from kafka_producer import producer_manager
from kafka_consumer import consume_messages

# --- Global WebSocket Manager ---
# Stores active WebSocket connections to broadcast updates to frontend clients.
active_websockets: List[WebSocket] = []

async def start_consumer_task():
    """
    Background task to run the Kafka consumer.
    This runs indefinitely to listen for messages from Kafka.
    """
    try:
        await consume_messages(active_websockets)
    except asyncio.CancelledError:
        print("Consumer task cancelled")

# --- Lifespan Context Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    
    Startup:
    1. Creates database tables if they don't exist.
    2. Starts the Kafka producer.
    3. Launches the Kafka consumer in a background task.
    
    Shutdown:
    1. Stops the Kafka producer specific resources.
    """
    # Startup logic
    create_db_and_tables()
    await producer_manager.start()
    
    # Run consumer in background so it doesn't block the main thread
    consumer_task = asyncio.create_task(start_consumer_task())
    print("Startup complete: DB connected, Kafka producer started, Consumer running.")
    
    yield
    
    # Shutdown logic
    consumer_task.cancel()
    await producer_manager.stop()
    print("Shutdown complete.")

# --- App Initialization ---
app = FastAPI(lifespan=lifespan)

# --- CORS Middleware ---
# Allows the Frontend (running on different port) to communicate with this Backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handles real-time WebSocket connections.
    1. Accepts connection.
    2. Adds client to the active list.
    3. Keeps connection alive until client disconnects.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # Keep the connection open and listen for any messages (ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_websockets.remove(websocket)

# --- REST API Endpoints ---

@app.post("/api/tasks", response_model=TaskRead)
async def create_new_task(task_in: TaskCreate, session: Session = Depends(get_session)):
    """
    Create a new task.
    1. Saves task to DB.
    2. Sends 'TASK_CREATED' event to Kafka.
    """
    task = create_task(session, task_in)
    
    # Produce Kafka Event
    event = {
        "event_type": "TASK_CREATED",
        "task_id": task.id,
        "title": task.title,
        "status": task.status
    }
    await producer_manager.send_message("task_events", event)
    
    return task

@app.get("/api/tasks", response_model=List[TaskRead])
def read_tasks(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """
    Retrieve a list of tasks with pagination.
    """
    return get_tasks(session, offset, limit)

@app.get("/api/tasks/{task_id}", response_model=TaskRead)
def read_task(task_id: int, session: Session = Depends(get_session)):
    """
    Retrieve a specific task by ID.
    Returns 404 if not found.
    """
    task = get_task(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/api/tasks/{task_id}", response_model=TaskRead)
async def update_task_status(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session)):
    """
    Update a task (e.g., change status).
    1. Updates DB.
    2. Sends 'TASK_STATUS_UPDATED' event to Kafka.
    """
    task = update_task(session, task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Produce Kafka Event if status changed
    if task_update.status:
        event = {
            "event_type": "TASK_STATUS_UPDATED",
            "task_id": task.id,
            "status": task.status
        }
        await producer_manager.send_message("task_events", event)
        
    return task

# Users API (for simple helper usage)

@app.post("/users", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    return crud.create_user(session, user)

@app.get("/users", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    return crud.get_users(session)
