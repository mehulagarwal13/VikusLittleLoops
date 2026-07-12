from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CheckoutItem(BaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(ge=1, default=1)


class CheckoutRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    address: str
    city: str
    state: str | None = None
    pincode: str | None = None
    notes: str | None = None
    coupon_code: str | None = None
    items: list[CheckoutItem]


class PaymentRefIn(BaseModel):
    """Legacy UTR reference fallback (kept for admin use)."""
    reference: str = Field(min_length=4, max_length=64)


class RazorpayVerifyIn(BaseModel):
    """Payload sent by the frontend after Razorpay checkout completes."""
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class OrderItemPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_name: str
    unit_price: Decimal
    quantity: int


class OrderPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: str
    payment_status: str
    subtotal: Decimal
    discount_amount: Decimal
    shipping_amount: Decimal
    total: Decimal
    payment_reference: str | None = None
    razorpay_order_id: str | None = None
    # These fields are populated transiently (not stored in DB) only on creation
    razorpay_key_id: str | None = None
    ship_name: str | None = None
    created_at: datetime
    items: list[OrderItemPublic] = []
