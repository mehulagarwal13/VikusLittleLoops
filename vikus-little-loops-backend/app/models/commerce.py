from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32))
    google_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
    cart: Mapped["Cart"] = relationship(back_populates="customer", uselist=False)
    wishlist_items: Mapped[list["Wishlist"]] = relationship(back_populates="customer")
    reviews: Mapped[list["Review"]] = relationship(back_populates="customer")  # type: ignore[name-defined]  # noqa: F821


class Cart(Base, TimestampMixin):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"))
    session_id: Mapped[str | None] = mapped_column(String(120), index=True)  # for guests

    customer: Mapped["Customer"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id", ondelete="SET NULL"))
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    cart: Mapped["Cart"] = relationship(back_populates="items")


class Wishlist(Base, TimestampMixin):
    __tablename__ = "wishlist"
    __table_args__ = (UniqueConstraint("customer_id", "product_id", name="uq_wishlist_item"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))

    customer: Mapped["Customer"] = relationship(back_populates="wishlist_items")


class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    discount_type: Mapped[str] = mapped_column(String(10), default="percent", nullable=False)  # percent | fixed
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    min_order_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    usage_limit: Mapped[int | None] = mapped_column(Integer)
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))

    status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False)
    # pending | confirmed | crafting | shipped | delivered | cancelled
    payment_status: Mapped[str] = mapped_column(String(24), default="unpaid", nullable=False)

    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    shipping_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    coupon_id: Mapped[int | None] = mapped_column(ForeignKey("coupons.id", ondelete="SET NULL"))

    # Shipping snapshot
    ship_name: Mapped[str | None] = mapped_column(String(120))
    ship_email: Mapped[str | None] = mapped_column(String(255), index=True)
    ship_phone: Mapped[str | None] = mapped_column(String(32))
    ship_address: Mapped[str | None] = mapped_column(Text)
    ship_city: Mapped[str | None] = mapped_column(String(80))
    ship_state: Mapped[str | None] = mapped_column(String(80))
    ship_pincode: Mapped[str | None] = mapped_column(String(16))
    notes: Mapped[str | None] = mapped_column(Text)

    customer: Mapped["Customer"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id", ondelete="SET NULL"))
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)  # snapshot
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")


class CustomOrder(Base, TimestampMixin):
    __tablename__ = "custom_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    color: Mapped[str | None] = mapped_column(String(80))
    size: Mapped[str | None] = mapped_column(String(80))
    yarn: Mapped[str | None] = mapped_column(String(80))
    budget: Mapped[str | None] = mapped_column(String(60))
    delivery_date: Mapped[date | None] = mapped_column(Date)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    inspiration_image_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(24), default="new", nullable=False)
    # new | reviewing | quoted | accepted | declined | completed
