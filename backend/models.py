from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItem(BaseModel):
    productId: str
    quantity: int


class OrderRequest(BaseModel):
    customerId: str
    items: List[OrderItem]


class OrderMessage(BaseModel):
    orderId: str
    customerId: str
    items: List[OrderItem]
    createdAt: datetime