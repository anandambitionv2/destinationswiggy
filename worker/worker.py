import json
import logging
import pyodbc
from azure.servicebus import ServiceBusClient
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


def get_sql_connection():
    logger.info("Opening SQL connection...")
    return pyodbc.connect(settings.sql_connection_string)


def save_to_db(order):
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
    conn.close()

    logger.info("DB insert successful")


def process_order(message):
    logger.info(f"Received message: {message.message_id}")

    try:
        body = str(message)
        logger.info(f"Raw message body: {body}")

        order = json.loads(body)

        logger.info(f"Parsed Order ID: {order.get('orderId')}")

        save_to_db(order)

        logger.info("Order processed successfully")

    except Exception as e:
        logger.exception("Error while processing message")
        raise  # re-raise so Service Bus handles retry


def main():
    logger.info("Worker starting...")

    client = ServiceBusClient.from_connection_string(
        settings.service_bus_connection_string
    )

    logger.info("Connected to Service Bus")

    with client:
        receiver = client.get_queue_receiver(
            queue_name=settings.service_bus_queue_name,
            max_wait_time=5
        )

        logger.info(f"Listening on queue: {settings.service_bus_queue_name}")

        with receiver:
            while True:
                messages = receiver.receive_messages(max_message_count=5)

                for message in messages:
                    try:
                        process_order(message)
                        receiver.complete_message(message)
                        logger.info("Message completed")
                    except Exception:
                        logger.error("Abandoning message")
                        receiver.abandon_message(message)


if __name__ == "__main__":
    main()