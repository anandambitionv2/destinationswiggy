
from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItem(BaseModel):
    menuItemId: str
    quantity: int


class OrderRequest(BaseModel):
    customerId: str
    restaurantId: str
    items: List[OrderItem]


class OrderMessage(BaseModel):
    orderId: str
    customerId: str
    restaurantId: str
    items: List[OrderItem]
    createdAt: datetime
