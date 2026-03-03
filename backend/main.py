from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from servicebus import ServiceBusPublisher
import logging

# -------------------------------
# Logging
# -------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="Order API")

# -------------------------------
# CORS Configuration
# -------------------------------
# Replace with your frontend URL
ALLOWED_ORIGINS = [
    "http://localhost:3000",              # local dev
    "http://20.26.2.68",          # AKS LoadBalancer
    "https://yourdomain.com"              # production domain (if using ingress)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Order Model
# -------------------------------
class Order(BaseModel):
    orderId: str
    customerId: str
    createdAt: str


# -------------------------------
# Service Bus Publisher
# -------------------------------
publisher = ServiceBusPublisher()


# -------------------------------
# Health Endpoint
# -------------------------------
@app.get("/health")
def health():
    return {"status": "healthy"}


# -------------------------------
# Order Endpoint
# -------------------------------
@app.post("/orders", status_code=202)
def create_order(order: Order):
    logger.info(f"Received order: {order.orderId}")
    publisher.send_message(order.dict())
    return {"message": "Order accepted"}