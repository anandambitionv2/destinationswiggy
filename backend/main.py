from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from models import OrderRequest
from servicebus import ServiceBusPublisher

app = FastAPI(title="Order API")

publisher = ServiceBusPublisher()

@app.post("/orders", status_code=202)
def create_order(order: OrderRequest):

    order_message = {
        "orderId": str(uuid4()),
        "customerId": order.customerId,
        "items": [item.dict() for item in order.items],
        "createdAt": datetime.utcnow().isoformat()
    }

    publisher.publish(order_message)

    return {
        "orderId": order_message["orderId"],
        "status": "Order accepted and queued"
    }