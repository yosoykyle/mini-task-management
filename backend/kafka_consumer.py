import asyncio
import json
from aiokafka import AIOKafkaConsumer
from fastapi import WebSocket
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = "task_events"

# --- Configuration ---
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = "task_events"

async def consume_messages(websockets: List[WebSocket]):
    """
    Connects to Kafka and continuously listens for messages on the 'task_events' topic.
    When a message is received, it broadcasts it to all active WebSocket connections.
    """
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="task_group",
        # Deserialize JSON bytes back to python dict
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    await consumer.start()
    try:
        # Continuous loop to fetch messages
        async for msg in consumer:
            event = msg.value
            print(f"Consumed event: {event}")
            
            # Broadcast to all connected clients
            # We iterate a copy to safely remove disconnected clients if needed
            for ws in list(websockets):
                try:
                    await ws.send_json(event)
                except Exception as e:
                    print(f"Failed to send to WS: {e}")
                    if ws in websockets:
                        websockets.remove(ws)
    finally:
        await consumer.stop()
