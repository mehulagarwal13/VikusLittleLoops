from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )  # null = general review (not tied to a product)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    author_name: Mapped[str] = mapped_column(String(120), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1..5
    title: Mapped[str | None] = mapped_column(String(160))
    body: Mapped[str | None] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    product: Mapped["Product | None"] = relationship(back_populates="reviews")  # type: ignore[name-defined]  # noqa: F821
    customer: Mapped["Customer"] = relationship(back_populates="reviews")  # type: ignore[name-defined]  # noqa: F821


class HomepageSection(Base, TimestampMixin):
    """Admin-editable homepage blocks (hero banner, featured rows, etc.)."""
    __tablename__ = "homepage_sections"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    # e.g. hero, featured_categories, best_sellers, instagram, story
    title: Mapped[str | None] = mapped_column(String(200))
    subtitle: Mapped[str | None] = mapped_column(String(400))
    content: Mapped[dict] = mapped_column(JSON, default=dict)  # flexible payload
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class FAQ(Base, TimestampMixin):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(primary_key=True)
    question: Mapped[str] = mapped_column(String(300), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Policy(Base, TimestampMixin):
    """Shipping / returns / privacy / terms — slug-addressable rich text."""
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Newsletter(Base, TimestampMixin):
    __tablename__ = "newsletter"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_subscribed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
