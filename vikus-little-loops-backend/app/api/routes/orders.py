import secrets
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_optional_customer
from app.core.database import get_db
from app.models.catalog import Product
from app.models.commerce import Coupon, Customer, Order, OrderItem
from app.schemas.order import CheckoutRequest, OrderPublic

router = APIRouter(prefix="/orders", tags=["orders"])

SHIPPING_FLAT = Decimal("0")  # free shipping (gift wrapping included)


def _order_number() -> str:
    return "VLL-" + secrets.token_hex(3).upper()


@router.post("", response_model=OrderPublic, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    customer: Customer | None = Depends(get_optional_customer),
):
    if not payload.items:
        raise HTTPException(status_code=422, detail="Cart is empty")

    # Server-authoritative pricing.
    subtotal = Decimal("0")
    order_items: list[OrderItem] = []
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product or not product.is_published:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} unavailable")
        unit = Decimal(str(product.price))
        if product.discount_percent:
            unit = (unit * (Decimal(100) - product.discount_percent) / Decimal(100)).quantize(Decimal("0.01"))
        subtotal += unit * item.quantity
        order_items.append(OrderItem(
            product_id=product.id,
            variant_id=item.variant_id,
            product_name=product.name,
            unit_price=unit,
            quantity=item.quantity,
        ))

    # Coupon
    discount = Decimal("0")
    coupon_obj = None
    if payload.coupon_code:
        coupon_obj = db.scalar(select(Coupon).where(Coupon.code == payload.coupon_code.upper()))
        if coupon_obj and coupon_obj.is_active:
            expired = coupon_obj.expires_at and coupon_obj.expires_at < datetime.now(timezone.utc)
            limit_hit = coupon_obj.usage_limit is not None and coupon_obj.used_count >= coupon_obj.usage_limit
            if not expired and not limit_hit and subtotal >= Decimal(str(coupon_obj.min_order_amount)):
                if coupon_obj.discount_type == "percent":
                    discount = (subtotal * Decimal(str(coupon_obj.value)) / Decimal(100)).quantize(Decimal("0.01"))
                else:
                    discount = Decimal(str(coupon_obj.value))
                discount = min(discount, subtotal)

    total = subtotal - discount + SHIPPING_FLAT

    order = Order(
        order_number=_order_number(),
        status="pending",
        payment_status="unpaid",
        subtotal=subtotal,
        discount_amount=discount,
        shipping_amount=SHIPPING_FLAT,
        total=total,
        coupon_id=coupon_obj.id if coupon_obj else None,
        customer_id=customer.id if customer else None,
        ship_name=payload.name,
        ship_email=payload.email,
        ship_phone=payload.phone,
        ship_address=payload.address,
        ship_city=payload.city,
        ship_state=payload.state,
        ship_pincode=payload.pincode,
        notes=payload.notes,
        items=order_items,
    )
    db.add(order)
    if coupon_obj and discount > 0:
        coupon_obj.used_count += 1
    db.commit()

    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order.id))
    return order


@router.get("/{order_number}", response_model=OrderPublic)
def get_order(order_number: str, db: Session = Depends(get_db)):
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.order_number == order_number)
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
