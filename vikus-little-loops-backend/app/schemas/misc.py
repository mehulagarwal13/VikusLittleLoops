from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr


# ---------- Reviews ----------
class ReviewCreate(BaseModel):
    product_id: int | None = None
    author_name: str
    rating: int
    title: str | None = None
    body: str | None = None
    photo_url: str | None = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int | None = None
    author_name: str
    rating: int
    title: str | None = None
    body: str | None = None
    photo_url: str | None = None
    is_approved: bool
    created_at: datetime


# ---------- Custom orders ----------
class CustomOrderCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    color: str | None = None
    size: str | None = None
    yarn: str | None = None
    budget: str | None = None
    delivery_date: date | None = None
    details: str
    inspiration_image_url: str | None = None


class CustomOrderOut(CustomOrderCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    created_at: datetime


# ---------- Newsletter ----------
class NewsletterIn(BaseModel):
    email: EmailStr


class NewsletterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    is_subscribed: bool


# ---------- Coupons ----------
class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percent"
    value: Decimal
    min_order_amount: Decimal = Decimal("0")
    usage_limit: int | None = None
    expires_at: datetime | None = None
    is_active: bool = True


class CouponOut(CouponCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    used_count: int


class CouponValidateOut(BaseModel):
    valid: bool
    message: str
    discount_type: str | None = None
    value: Decimal | None = None


# ---------- FAQ / Policy ----------
class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str | None = None
    is_active: bool = True
    sort_order: int = 0


class FAQOut(FAQCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    category: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class PolicyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    body: str
    is_active: bool


# ---------- Homepage sections ----------
class HomepageSectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    key: str
    title: str | None = None
    subtitle: str | None = None
    content: dict = {}
    is_active: bool
    sort_order: int


class HomepageSectionUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    content: dict | None = None
    is_active: bool | None = None
    sort_order: int | None = None
