from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.admin import Admin
from app.models.catalog import Category, Product
from app.models.commerce import CustomOrder, Customer, Order, OrderItem
from app.models.content import Review
from app.schemas.admin import CustomerOut, OrderOut, PaymentUpdate, StatusUpdate
from app.schemas.catalog import ProductListOut
from app.schemas.misc import ReviewCreate, ReviewOut

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------- Dashboard stats ----------------
@router.get("/stats")
def stats(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    total_products = db.scalar(select(func.count(Product.id))) or 0
    published = db.scalar(select(func.count(Product.id)).where(Product.is_published.is_(True))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_categories = db.scalar(select(func.count(Category.id))) or 0
    revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != "cancelled")
    ) or 0
    low_stock = db.scalar(select(func.count(Product.id)).where(Product.stock <= 3)) or 0
    new_custom_orders = db.scalar(
        select(func.count(CustomOrder.id)).where(CustomOrder.status == "new")
    ) or 0

    # Revenue series — last 7 days
    today = datetime.now(timezone.utc).date()
    series = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        amount = db.scalar(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                func.date(Order.created_at) == day, Order.status != "cancelled"
            )
        ) or 0
        series.append({"date": day.strftime("%b %d"), "revenue": float(amount)})

    # Order status breakdown
    rows = db.execute(select(Order.status, func.count(Order.id)).group_by(Order.status)).all()
    status_breakdown = [{"status": s, "count": c} for s, c in rows]

    recent_orders = db.scalars(
        select(Order).order_by(Order.created_at.desc()).limit(5)
    ).all()
    recent_custom = db.scalars(
        select(CustomOrder).order_by(CustomOrder.created_at.desc()).limit(5)
    ).all()

    return {
        "cards": {
            "products": total_products,
            "published_products": published,
            "orders": total_orders,
            "customers": total_customers,
            "categories": total_categories,
            "revenue": float(revenue),
            "low_stock": low_stock,
            "new_custom_orders": new_custom_orders,
        },
        "revenue_series": series,
        "status_breakdown": status_breakdown,
        "recent_orders": [
            {"id": o.id, "order_number": o.order_number, "total": float(o.total),
             "status": o.status, "created_at": o.created_at.isoformat()}
            for o in recent_orders
        ],
        "recent_custom_orders": [
            {"id": c.id, "name": c.name, "status": c.status,
             "created_at": c.created_at.isoformat()}
            for c in recent_custom
        ],
    }


# ---------------- Admin product list (incl. drafts) ----------------
@router.get("/products", response_model=list[ProductListOut])
def admin_products(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.scalars(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category))
        .order_by(Product.created_at.desc())
    ).all()


# ---------------- Orders ----------------
@router.get("/orders", response_model=list[OrderOut])
def admin_orders(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.scalars(
        select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    ).all()


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int, payload: StatusUpdate,
    db: Session = Depends(get_db), _: Admin = Depends(get_current_admin),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    return order


@router.patch("/orders/{order_id}/payment", response_model=OrderOut)
def update_order_payment(
    order_id: int, payload: PaymentUpdate,
    db: Session = Depends(get_db), _: Admin = Depends(get_current_admin),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.payment_status = payload.payment_status
    # Confirm the order automatically once payment is verified.
    if payload.payment_status == "paid" and order.status == "pending":
        order.status = "confirmed"
    db.commit()
    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    return order


# ---------------- Customers ----------------
@router.get("/customers", response_model=list[CustomerOut])
def admin_customers(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.scalars(select(Customer).order_by(Customer.created_at.desc())).all()


# ---------------- Reviews moderation ----------------
@router.get("/reviews", response_model=list[ReviewOut])
def admin_reviews(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.scalars(select(Review).order_by(Review.created_at.desc())).all()


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review_as_admin(
    payload: ReviewCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    """Admin-created review — approved immediately, shows on the storefront."""
    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=422, detail="Rating must be 1–5")
    if payload.product_id is not None and not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    obj = Review(**payload.model_dump(), is_approved=True)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/reviews/{review_id}/approve", response_model=ReviewOut)
def approve_review(
    review_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = not review.is_approved
    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()


# ---------------- Custom order status ----------------
@router.patch("/custom-orders/{co_id}/status")
def update_custom_order_status(
    co_id: int, payload: StatusUpdate,
    db: Session = Depends(get_db), _: Admin = Depends(get_current_admin),
):
    co = db.get(CustomOrder, co_id)
    if not co:
        raise HTTPException(status_code=404, detail="Custom order not found")
    co.status = payload.status
    db.commit()
    return {"id": co.id, "status": co.status}
