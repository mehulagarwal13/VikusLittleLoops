from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_name: str
    unit_price: Decimal
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: str
    payment_status: str
    subtotal: Decimal
    discount_amount: Decimal
    shipping_amount: Decimal
    total: Decimal
    ship_name: str | None = None
    ship_email: str | None = None
    ship_phone: str | None = None
    ship_address: str | None = None
    ship_city: str | None = None
    ship_state: str | None = None
    ship_pincode: str | None = None
    notes: str | None = None
    created_at: datetime
    items: list[OrderItemOut] = []


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    is_active: bool
    created_at: datetime


class StatusUpdate(BaseModel):
    status: str
