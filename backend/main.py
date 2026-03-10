
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pyodbc
import logging
from servicebus import ServiceBusPublisher
from config import settings

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
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://20.26.2.68",
    "http://20.49.158.84",
    "https://yourdomain.com"
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
    restaurantId: str
    itemId: str
    createdAt: str


# -------------------------------
# Service Bus Publisher
# -------------------------------
publisher = ServiceBusPublisher()


# -------------------------------
# SQL Connection
# -------------------------------
def get_sql_connection():
    """
    Creates a connection to Azure SQL using the
    same connection string used by the worker.
    """
    try:
        conn = pyodbc.connect(settings.sql_connection_string, timeout=30)
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise


# -------------------------------
# Health Endpoint
# -------------------------------
@app.get("/health")
def health():
    return {"status": "healthy"}


# -------------------------------
# Get Restaurants
# -------------------------------
@app.get("/restaurants")
def get_restaurants():

    logger.info("Fetching restaurants")

    conn = get_sql_connection()
    cursor = conn.cursor()

    rows = cursor.execute("""
        SELECT Id, Name, Rating, DeliveryTime, ImageUrl
        FROM Restaurants
    """).fetchall()

    conn.close()

    restaurants = [
        {
            "id": r.Id,
            "name": r.Name,
            "rating": r.Rating,
            "time": r.DeliveryTime,
            "image": r.ImageUrl
        }
        for r in rows
    ]

    return restaurants


# -------------------------------
# Get Menu for Restaurant
# -------------------------------
@app.get("/restaurants/{restaurant_id}/menu")
def get_menu(restaurant_id: str):

    logger.info(f"Fetching menu for restaurant {restaurant_id}")

    conn = get_sql_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT Id, Name, Price
        FROM MenuItems
        WHERE RestaurantId = ?
        """,
        restaurant_id
    ).fetchall()

    conn.close()

    menu = [
        {
            "id": r.Id,
            "name": r.Name,
            "price": r.Price
        }
        for r in rows
    ]

    return menu


# -------------------------------
# Order Endpoint
# -------------------------------
@app.post("/orders", status_code=202)
def create_order(order: Order):

    logger.info(f"Received order {order.orderId}")

    try:
        publisher.publish(order.dict())
        logger.info(f"Order {order.orderId} published to Service Bus")

    except Exception as e:
        logger.error(f"Failed to publish order: {e}")
        raise

    return {"message": "Order accepted"}
