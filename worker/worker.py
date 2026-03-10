
import json
import logging
import pyodbc
import sys
import time
from azure.servicebus import ServiceBusClient
from azure.identity import DefaultAzureCredential
from config import settings

# -------------------------------
# Logging
# -------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)


# -------------------------------
# SQL Connection
# -------------------------------
def get_sql_connection():
    """
    Establish connection to Azure SQL using Managed Identity
    """
    logger.info("Attempting to open SQL connection...")

    try:
        conn = pyodbc.connect(settings.sql_connection_string, timeout=60)

        logger.info("SQL connection established successfully")

        return conn

    except pyodbc.Error as e:

        logger.error(f"DATABASE CONNECTION ERROR: {e}")

        raise


# -------------------------------
# Save Order To Database
# -------------------------------
def save_to_db(order):

    conn = None

    try:

        order_id = order.get("orderId")
        customer_id = order.get("customerId")
        restaurant_id = order.get("restaurantId")
        item_id = order.get("itemId")
        created_at = order.get("createdAt")

        if not order_id:
            raise ValueError("orderId missing")

        if not item_id:
            raise ValueError("itemId missing")

        logger.info(f"Inserting order {order_id} into database")

        conn = get_sql_connection()

        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO Orders (OrderId, CustomerId, RestaurantId, ItemId, CreatedAt)
            VALUES (?, ?, ?, ?, ?)
            """,
            order_id,
            customer_id,
            restaurant_id,
            item_id,
            created_at
        )

        conn.commit()

        logger.info(f"Order {order_id} successfully committed to database")

    except Exception as e:

        logger.error(f"Failed to save order to DB: {str(e)}")

        raise

    finally:

        if conn:
            conn.close()
            logger.info("SQL connection closed")


# -------------------------------
# Process Service Bus Message
# -------------------------------
def process_order(message):

    try:

        body = b"".join(message.body).decode("utf-8")

        logger.info(f"Processing raw message: {body}")

        order = json.loads(body)

        if not order.get("orderId"):
            raise ValueError("Message missing orderId")

        save_to_db(order)

    except json.JSONDecodeError:

        logger.error("Invalid JSON message")

        raise

    except Exception as e:

        logger.error(f"Processing logic failed: {e}")

        raise


# -------------------------------
# Worker Main Loop
# -------------------------------
def main():

    logger.info("Worker starting up...")

    try:

        logger.info("Initializing Managed Identity credential")

        credential = DefaultAzureCredential()

        logger.info("Creating Service Bus client")

        client = ServiceBusClient(
            fully_qualified_namespace=settings.service_bus_namespace,
            credential=credential
        )

        with client:

            receiver = client.get_queue_receiver(
                queue_name=settings.service_bus_queue_name
            )

            logger.info(
                f"Worker listening on queue: {settings.service_bus_queue_name}"
            )

            with receiver:

                for message in receiver:

                    try:

                        logger.info(
                            f"Received message: {message.message_id}"
                        )

                        process_order(message)

                        receiver.complete_message(message)

                        logger.info(
                            f"Message {message.message_id} completed"
                        )

                    except Exception:

                        logger.error(
                            f"Processing failed for message {message.message_id}. "
                            "Abandoning message for retry"
                        )

                        receiver.abandon_message(message)

                        time.sleep(2)

    except Exception as e:

        logger.critical(f"FATAL ERROR: Worker crashed: {e}")

        sys.exit(1)


# -------------------------------
# Entry Point
# -------------------------------
if __name__ == "__main__":

    main()
