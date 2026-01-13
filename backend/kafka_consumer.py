"""
Kafka Consumer Module

This module is the "Listener" or "Radio Receiver".

Its job is to:
1.  Tune in to the Kafka "Ticket Rail" (Topic).
2.  Wait for new messages (Events).
3.  When a message arrives (e.g., "Task #5 moved to Done"), it shouts it out to all connected users.

Why do we touch WebSockets here?
Because this is how we get Real-Time updates. The Backend hears the event from Kafka, 
and immediately pushes it to the Frontend via WebSocket.
"""

import asyncio
import json
from aiokafka import AIOKafkaConsumer
from fastapi import WebSocket
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

# --- Configuration ---
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = "task_events"

async def consume_messages(websockets: List[WebSocket]):
    """
    The Main Listening Loop.
    
    This function runs FOREVER (while the app is on).
    It effectively says: "Is there a new message? No? Okay, I'll wait. How about now?"
    
    Args:
        websockets: The list of currently connected users (phone lines) to broadcast to.
    """
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="task_group", # Important: Tells Kafka "We are the Task Board Listeners"
        # Turns the bytes back into a Python Dictionary
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    await consumer.start()
    try:
        # This loop will block here waiting for the next message.
        # It won't freeze the whole computer though, thanks to 'async'.
        async for msg in consumer:
            event = msg.value
            print(f"Consumed event: {event}")
            
            # --- BROADCAST ---
            # Forward the event to the Frontend clients so they update their screens.
            for ws in list(websockets):
                try:
                    await ws.send_json(event)
                except Exception as e:
                    print(f"Failed to send to WS: {e}")
                    # If sending fails (maybe they closed the tab), remove them.
                    if ws in websockets:
                        websockets.remove(ws)
    finally:
        # Clean up if the loop ever stops
        await consumer.stop()
