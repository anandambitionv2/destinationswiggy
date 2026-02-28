import json
from azure.servicebus import ServiceBusClient, ServiceBusMessage
from config import settings


class ServiceBusPublisher:

    def __init__(self):
        self.client = ServiceBusClient.from_connection_string(
            settings.service_bus_connection_string
        )
        self.queue_name = settings.service_bus_queue_name

    def publish(self, message: dict):

        with self.client:
            sender = self.client.get_queue_sender(
                queue_name=self.queue_name
            )

            with sender:
                message_json = json.dumps(message)
                sb_message = ServiceBusMessage(message_json)
                sender.send_messages(sb_message)