import json
import pyodbc
from azure.servicebus import ServiceBusClient
from config import settings


def get_sql_connection():
    return pyodbc.connect(settings.sql_connection_string)


def save_to_db(order):
    conn = get_sql_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO Orders (OrderId, CustomerId, CreatedAt)
        VALUES (?, ?, ?)
        """,
        order["orderId"],
        order["customerId"],
        order["createdAt"]
    )

    conn.commit()
    conn.close()


def process_order(message_body: str):
    order = json.loads(message_body)
    print(f"Processing Order: {order['orderId']}")
    save_to_db(order)
    print("Order saved successfully.\n")


def main():
    client = ServiceBusClient.from_connection_string(
        settings.service_bus_connection_string
    )

    print("Worker started...")

    with client:
        receiver = client.get_queue_receiver(
            queue_name=settings.service_bus_queue_name,
            max_wait_time=5
        )

        with receiver:
            while True:
                messages = receiver.receive_messages(max_message_count=5)

                for message in messages:
                    try:
                        process_order(str(message))
                        receiver.complete_message(message)
                    except Exception as e:
                        print("Error:", e)
                        receiver.abandon_message(message)


if __name__ == "__main__":
    main()