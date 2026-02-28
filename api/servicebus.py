"""
servicebus.py

This file is responsible ONLY for sending messages to Azure Service Bus.
It does not know anything about FastAPI, HTTP, or frontend logic.

Its single responsibility:
    → Take a Python dictionary
    → Convert it to JSON
    → Send it to a Service Bus queue
"""

import json
from azure.servicebus import ServiceBusClient, ServiceBusMessage
from app.config import settings


class ServiceBusPublisher:
    """
    This class handles publishing messages to Azure Service Bus.

    It encapsulates:
        - Connection creation
        - Queue sender creation
        - Message serialization
        - Sending messages

    This keeps Azure-specific logic separate from API logic.
    """

    def __init__(self):
        """
        Constructor runs when the class is instantiated.

        It creates a ServiceBusClient using the connection string
        stored in environment variables.

        NOTE:
        Later in AKS, we can replace this with Managed Identity
        instead of using a connection string.
        """

        # Create a client object that connects to Azure Service Bus
        self.client = ServiceBusClient.from_connection_string(
            settings.service_bus_connection_string
        )

        # Store queue name from config
        self.queue_name = settings.service_bus_queue_name


    def publish(self, message: dict):
        """
        Publishes a message to the configured Service Bus queue.

        Parameters:
            message (dict): The order message we want to send.

        Steps:
            1. Open Service Bus connection
            2. Create a sender for the queue
            3. Convert dictionary to JSON string
            4. Wrap JSON inside ServiceBusMessage
            5. Send the message
        """

        # Using context manager ensures the connection closes properly
        with self.client:

            # Create a sender object for the specific queue
            sender = self.client.get_queue_sender(
                queue_name=self.queue_name
            )

            # Open sender connection
            with sender:

                # Convert Python dictionary to JSON string
                message_json = json.dumps(message)

                # Wrap JSON string inside a ServiceBusMessage object
                sb_message = ServiceBusMessage(message_json)

                # Send message to Azure Service Bus queue
                sender.send_messages(sb_message)

                # Optional: print log (use logging in production)
                print("Message successfully sent to Service Bus queue.")