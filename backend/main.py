"""
Main FastAPI Application Module

This is the "Brain" or "Control Center" of the backend.

It serves as the main entry point where everything starts.
It handles:
1.  **FastAPI App**: Initializes the web server framework.
2.  **Database & Kafka Life Cycle**: Controls what happens when the app starts (connecting to DB/Kafka) and stops.
3.  **WebSockets**: Manages real-time live connections (like a phone call) so users see updates instantly.
4.  **API Endpoints**: The specific URLs (like /api/tasks) that the Frontend talks to not just to save data, but to trigger events.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import json
import asyncio

# Import our custom modules
from database import create_db_and_tables, get_session
from models import Task, TaskCreate, TaskUpdate, TaskRead, User
import crud # Contains the direct database operations (Create, Read, Update, Delete)
from kafka_producer import producer_manager
from kafka_consumer import consume_messages

# --- Global WebSocket Manager ---
# This list holds all currently connected clients (users with the page open).
# Think of this as a list of phone numbers we are currently on a call with.
# When something happens (like a new task), we shout the news to everyone in this list.
active_websockets: List[WebSocket] = []

async def start_consumer_task():
    """
    Background Task for Kafka Consumer
    
    This runs heavily in the background, like a dedicated radio operator listening for signals.
    It waits for messages from Kafka (the 'Ticket Rail') and when it hears one,
    it broadcasts it to the active websockets.
    """
    try:
        await consume_messages(active_websockets)
    except asyncio.CancelledError:
        print("Consumer task cancelled")

# --- Lifespan Context Manager ---
# This special function defines what happens when the server turns ON and turns OFF.
# It's like the "Open Sign" and "Close Sign" procedures for a shop.
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    
    STARTUP (When you run the server):
    1.  Create database tables if they are missing (Preparation).
    2.  Start the Kafka Producer (The 'Writer' is ready).
    3.  Start the Kafka Consumer in the background (The 'Reader' starts listening).
    
    SHUTDOWN (When you stop the server):
    1.  Stop the background consumer.
    2.  Properly disconnect the Kafka Producer so no data is lost.
    """
    # --- STARTUP LOGIC ---
    create_db_and_tables()
    await producer_manager.start()
    
    # Run consumer in a separate background loop so it doesn't block the main app
    consumer_task = asyncio.create_task(start_consumer_task())
    print("Startup complete: DB connected, Kafka producer started, Consumer running.")
    
    yield # This is where the app actually runs and serves requests
    
    # --- SHUTDOWN LOGIC ---
    consumer_task.cancel()
    await producer_manager.stop()
    print("Shutdown complete.")

# --- App Initialization ---
# Create the actual FastAPI application using the lifespan logic defined above.
app = FastAPI(lifespan=lifespan)

# --- CORS Middleware ---
# "Cross-Origin Resource Sharing"
# By default, browsers block frontend code from talking to a backend on a different port/address.
# This code tells the browser: "It's okay, allow the frontend to talk to us."
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins. In a real app, you'd list specific domains (e.g. 'http://localhost:3000')
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time Connection Endpoint.
    
    When the Frontend connects to 'ws://localhost:8000/ws', this function runs.
    It's different from a normal API request because the connection STAYS OPEN.
    
    The logic:
    1.  **Accept**: Answer the call.
    2.  **Add to List**: Write down their number (store in active_websockets).
    3.  **Listen**: Keep the line open until they hang up.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # We just wait here to keep the connection alive.
            # If the client sends a message, we receive it, but mostly we just use this to push data OUT.
            await websocket.receive_text()
    except WebSocketDisconnect:
        # If the user closes the tab, remove them from the list so we don't try to talk to a dead line.
        active_websockets.remove(websocket)

# --- REST API Endpoints ---
# These are the standard "Request -> Response" actions.

@app.post("/api/tasks", response_model=TaskRead)
async def create_new_task(task_in: TaskCreate, session: Session = Depends(get_session)):
    """
    CREATE a New Task
    
    Steps:
    1.  **Save to DB**: Uses the crud module to save the task permanently in the database.
    2.  **Notify Kafka**: Sends a "TASK_CREATED" message to the Kafka 'Ticket Rail'.
        This allows other parts of the system (like the real-time websocket consumer) to pick it up.
    """
    task = crud.create_task(session, task_in)
    
    # Prepare the event data ticket
    event = {
        "event_type": "TASK_CREATED",
        "task_id": task.id,
        "title": task.title,
        "status": task.status
    }
    
    # Send to Kafka (The 'Writer' puts the ticket on the rail)
    await producer_manager.send_message("task_events", event)
    
    return task

@app.get("/api/tasks", response_model=List[TaskRead])
def read_tasks(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """
    GET all Tasks
    
    Uses pagination (offset/limit) so we don't try to load 1 million tasks at once if the DB gets huge.
    """
    return crud.get_tasks(session, offset, limit)

@app.get("/api/tasks/{task_id}", response_model=TaskRead)
def read_task(task_id: int, session: Session = Depends(get_session)):
    """
    GET a Single Task by ID
    """
    task = crud.get_task(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/api/tasks/{task_id}", response_model=TaskRead)
async def update_task_status(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session)):
    """
    UPDATE an Existing Task
    
    Steps:
    1.  **Update DB**: Changes the details in the database.
    2.  **Notify Kafka**: If the Status changed, we send a "TASK_STATUS_UPDATED" event.
        This is how the board knows to move the card from "Todo" to "In Progress" live for everyone else.
    """
    task = crud.update_task(session, task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Only produce an event if the status actually changed
    if task_update.status:
        event = {
            "event_type": "TASK_STATUS_UPDATED",
            "task_id": task.id,
            "status": task.status
        }
        await producer_manager.send_message("task_events", event)
        
    return task

# --- User API Endpoints ---
# Simple endpoints to manage users.

@app.post("/users", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    return crud.create_user(session, user)

@app.get("/users", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    return crud.get_users(session)
