import json
import logging
import pyodbc
import sys
import time
from azure.servicebus import ServiceBusClient
from config import settings

# Configure logging to output to stdout for kubectl logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

def get_sql_connection():
    """
    Establishes connection to Azure SQL using Managed Identity.
    The 'timeout' and 'UID' (Client ID) are critical here.
    """
    logger.info("Attempting to open SQL connection...")
    try:
        # We use a 60s timeout to allow for the Managed Identity handshake
        conn = pyodbc.connect(settings.sql_connection_string, timeout=60)
        logger.info("SQL Connection established successfully.")
        return conn
    except pyodbc.Error as e:
        logger.error(f"DATABASE CONNECTION ERROR: {e}")
        # We re-raise to be caught by the process_order exception handler
        raise

def save_to_db(order):
    """
    Inserts the parsed order into the SQL database.
    """
    conn = None
    try:
        order_id = order.get("orderId")
        customer_id = order.get("customerId")
        created_at = order.get("createdAt")

        logger.info(f"Inserting order {order_id} into DB")
        
        conn = get_sql_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO Orders (OrderId, CustomerId, CreatedAt)
            VALUES (?, ?, ?)
            """,
            order_id,
            customer_id,
            created_at
        )

        conn.commit()
        logger.info(f"Successfully committed Order {order_id} to database.")
    
    except Exception as e:
        logger.error(f"Failed to save to DB: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()
            logger.info("SQL connection closed.")

def process_order(message):
    """
    Parses the Service Bus message and triggers the DB save.
    """
    try:
        # Convert message body to string/json
        body = str(message)
        logger.info(f"Processing Raw Message: {body}")
        
        order = json.loads(body)
        
        if not order.get("orderId"):
            raise ValueError("Message body missing orderId")

        save_to_db(order)
        
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON format in message: {message}")
        raise
    except Exception as e:
        logger.error(f"Processing logic failed: {e}")
        raise

def main():
    """
    Main loop that stays alive and listens to the Service Bus.
    """
    logger.info("Worker starting up...")
    
    try:
        # Initialize the Service Bus Client
        client = ServiceBusClient.from_connection_string(
            settings.service_bus_connection_string
        )

        with client:
            # max_wait_time=None ensures the receiver stays open
            receiver = client.get_queue_receiver(
                queue_name=settings.service_bus_queue_name
            )

            logger.info(f"Worker is now listening on queue: {settings.service_bus_queue_name}")

            with receiver:
                # This 'for' loop is a generator that waits for messages indefinitely.
                # This prevents the script from finishing and the Pod from 'Completing'.
                for message in receiver:
                    try:
                        process_order(message)
                        
                        # Tell Service Bus the message is handled so it's deleted
                        receiver.complete_message(message)
                        logger.info(f"Message {message.message_id} completed.")
                        
                    except Exception as e:
                        logger.error(f"Worker encountered an error. Abandoning message for retry.")
                        # Message goes back to queue for another attempt
                        receiver.abandon_message(message)
                        # Optional: Add a small sleep to prevent rapid-fire crashing
                        time.sleep(2)

    except Exception as e:
        logger.critical(f"FATAL ERROR: Worker process crashed: {e}")
        # Exit with code 1 so Kubernetes shows 'Error' status instead of 'Completed'
        sys.exit(1)

if __name__ == "__main__":
    main()