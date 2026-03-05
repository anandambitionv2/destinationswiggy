import json
import logging
import pyodbc
import sys
from azure.servicebus import ServiceBusClient
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    stream=sys.stdout
)

logger = logging.getLogger(__name__)

def get_sql_connection():
    logger.info("Attempting to open SQL connection...")
    try:
        # Increased timeout to 60s for Managed Identity handshake
        conn = pyodbc.connect(settings.sql_connection_string, timeout=60)
        logger.info("SQL Connection established successfully.")
        return conn
    except pyodbc.Error as e:
        logger.error(f"DATABASE CONNECTION ERROR: {e}")
        raise

def save_to_db(order):
    conn = None
    try:
        logger.info(f"Inserting order {order.get('orderId')} into DB")
        conn = get_sql_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO Orders (OrderId, CustomerId, CreatedAt)
            VALUES (?, ?, ?)
            """,
            order.get("orderId"),
            order.get("customerId"),
            order.get("createdAt")
        )

        conn.commit()
        logger.info(f"Successfully saved Order {order.get('orderId')}")
    except Exception as e:
        logger.error(f"Failed to save to DB: {e}")
        raise
    finally:
        if conn:
            conn.close()

def process_order(message):
    try:
        body = str(message)
        order = json.loads(body)
        logger.info(f"Processing Order ID: {order.get('orderId')}")
        save_to_db(order)
    except Exception as e:
        logger.error(f"Error while processing message: {e}")
        raise 

def main():
    logger.info("Worker starting up...")
    
    try:
        client = ServiceBusClient.from_connection_string(settings.service_bus_connection_string)
        logger.info("Connected to Service Bus")

        with client:
            receiver = client.get_queue_receiver(
                queue_name=settings.service_bus_queue_name,
                max_wait_time=5
            )

            logger.info(f"Listening on queue: {settings.service_bus_queue_name}")

            with receiver:
                for message in receiver:
                    try:
                        process_order(message)
                        receiver.complete_message(message)
                        logger.info("Message completed and removed from queue")
                    except Exception:
                        logger.error("Processing failed. Abandoning message for retry.")
                        receiver.abandon_message(message)
    except Exception as e:
        logger.critical(f"Worker crashed: {e}")

if __name__ == "__main__":
    main()