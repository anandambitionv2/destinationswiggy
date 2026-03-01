import json
import struct
import pyodbc
from azure.identity import DefaultAzureCredential
from azure.servicebus import ServiceBusClient
from config import settings


def get_sql_connection():
    """
    Acquire Azure AD token using DefaultAzureCredential
    and connect to Azure SQL using token-based authentication.
    """

    credential = DefaultAzureCredential()

    print("Acquiring access token for Azure SQL...")
    token = credential.get_token("https://database.windows.net/.default")

    token_bytes = token.token.encode("utf-16-le")
    token_struct = struct.pack(f"<I{len(token_bytes)}s", len(token_bytes), token_bytes)

    conn = pyodbc.connect(
        settings.sql_connection_string,
        attrs_before={1256: token_struct}
    )

    return conn


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

    print("Order saved to Azure SQL successfully.\n")


def main():
    client = ServiceBusClient.from_connection_string(
        settings.service_bus_connection_string
    )

    print("Worker started. Listening to queue...")

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
                        print("Error processing message:", e)
                        receiver.abandon_message(message)


if __name__ == "__main__":
    main()