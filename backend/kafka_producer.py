"""
Kafka Producer Module

This module handles sending messages to the Kafka broker.
It uses 'aiokafka' for asynchronous communication.
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
    Manages the lifecycle of the AIOKafkaProducer.
    Ensures the producer is started and stopped correctly with the FastAPI app.
    """
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            # Serialize all values to JSON bytes
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    async def start(self):
        """Start the Kafka producer connection."""
        await self.producer.start()

    async def stop(self):
        """Stop the Kafka producer connection."""
        await self.producer.stop()

    async def send_message(self, topic: str, message: dict):
        """
        Send a JSON message to a specific Kafka topic.
        """
        try:
            await self.producer.send_and_wait(topic, message)
        except Exception as e:
            print(f"Failed to send Kafka message: {e}")

# Global instance to be imported by other modules
producer_manager = KafkaProducerManager()

async def get_kafka_producer():
    return producer_manager
