from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_customer
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.commerce import Customer, Order
from app.schemas.customer import (
    CustomerLogin,
    CustomerProfile,
    CustomerRegister,
    CustomerToken,
    CustomerUpdate,
    GoogleAuthRequest,
)
from app.schemas.order import OrderPublic

router = APIRouter(prefix="/customer", tags=["customer"])


def _claim_guest_orders(db: Session, customer: Customer):
    """Attach any guest orders placed with this email to the account."""
    db.execute(
        update(Order)
        .where(Order.customer_id.is_(None), Order.ship_email == customer.email)
        .values(customer_id=customer.id)
    )
    db.commit()


def _token_for(customer: Customer) -> CustomerToken:
    token = create_access_token(customer.id, extra={"role": "customer"})
    return CustomerToken(access_token=token)


@router.post("/register", response_model=CustomerToken, status_code=status.HTTP_201_CREATED)
def register(payload: CustomerRegister, db: Session = Depends(get_db)):
    if db.scalar(select(Customer).where(Customer.email == payload.email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    customer = Customer(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    _claim_guest_orders(db, customer)
    return _token_for(customer)


@router.post("/login", response_model=CustomerToken)
def login(payload: CustomerLogin, db: Session = Depends(get_db)):
    customer = db.scalar(select(Customer).where(Customer.email == payload.email))
    if not customer or not customer.hashed_password or not verify_password(payload.password, customer.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not customer.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    _claim_guest_orders(db, customer)
    return _token_for(customer)


@router.post("/google", response_model=CustomerToken)
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google sign-in is not configured")
    try:
        from google.auth.transport import requests as g_requests
        from google.oauth2 import id_token as g_id_token

        info = g_id_token.verify_oauth2_token(
            payload.credential, g_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = info.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")

    customer = db.scalar(select(Customer).where(Customer.email == email))
    if not customer:
        customer = Customer(
            name=info.get("name") or email.split("@")[0],
            email=email,
            google_id=info.get("sub"),
            avatar_url=info.get("picture"),
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    else:
        # link google id / avatar if first time via Google
        if not customer.google_id:
            customer.google_id = info.get("sub")
        if not customer.avatar_url:
            customer.avatar_url = info.get("picture")
        db.commit()

    _claim_guest_orders(db, customer)
    return _token_for(customer)


@router.get("/me", response_model=CustomerProfile)
def me(current: Customer = Depends(get_current_customer)):
    return current


@router.patch("/me", response_model=CustomerProfile)
def update_me(
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current: Customer = Depends(get_current_customer),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current, field, value)
    db.commit()
    db.refresh(current)
    return current


@router.get("/orders", response_model=list[OrderPublic])
def my_orders(
    db: Session = Depends(get_db),
    current: Customer = Depends(get_current_customer),
):
    return db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_id == current.id)
        .order_by(Order.created_at.desc())
    ).all()
