import json
import time
from azure.servicebus import ServiceBusClient
from config import settings


def process_order(message_body: str):
    """
    Simulate order processing.
    Later we will insert into DB here.
    """
    order = json.loads(message_body)

    print("Processing Order:", order["orderId"])
    print("Customer:", order["customerId"])
    print("Items:", order["items"])

    # Simulate processing time
    time.sleep(2)

    print("Order processed successfully\n")


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

                        # Mark message as completed (removed from queue)
                        receiver.complete_message(message)

                    except Exception as e:
                        print("Error processing message:", e)
                        receiver.abandon_message(message)


if __name__ == "__main__":
    main()