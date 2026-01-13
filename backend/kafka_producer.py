"""
Kafka Producer Module

This module is the "Sender" or "Broadcaster".

When something important happens in the system (like "New Task Created"),
this module's job is to:
1.  Package that info into a message (JSON).
2.  Send it to the Kafka "Ticket Rail" (Topic).

It uses `aiokafka` which means it sends messages *asynchronously* (it doesn't freeze the app while waiting for the postman).
"""

from aiokafka import AIOKafkaProducer
import json
import os
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class KafkaProducerManager:
    """
    Manager for the Kafka Producer.
    
    Think of this as the "Post Office Department" of our app.
    It handles opening the office (start), sending letters (send_message), and closing up (stop).
    """
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            # This automatically turns our Python dictionaries into bytes (JSON string) before sending
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    async def start(self):
        """Open the connection to Kafka."""
        await self.producer.start()

    async def stop(self):
        """Close the connection to Kafka."""
        await self.producer.stop()

    async def send_message(self, topic: str, message: dict):
        """
        Send a message.
        
        Args:
            topic: The "Channel" or "Subject" (e.g., 'task_events').
            message: The actual data (e.g., {'task_id': 1, 'status': 'Done'}).
        """
        try:
            # send_and_wait ensures the message actually reached Kafka before we move on.
            await self.producer.send_and_wait(topic, message)
        except Exception as e:
            print(f"Failed to send Kafka message: {e}")

# Global instance
# We create one "Manager" here and reuse it everywhere in the app.
producer_manager = KafkaProducerManager()

async def get_kafka_producer():
    return producer_manager
