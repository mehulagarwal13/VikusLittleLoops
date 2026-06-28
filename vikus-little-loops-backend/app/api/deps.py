from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.admin import Admin
from app.models.commerce import Customer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
oauth2_customer = OAuth2PasswordBearer(tokenUrl="api/customer/login", auto_error=False)

_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise _credentials_exc
    admin_id = payload.get("sub")
    if admin_id is None:
        raise _credentials_exc
    admin = db.get(Admin, int(admin_id))
    if not admin or not admin.is_active:
        raise _credentials_exc
    return admin


def get_optional_customer(
    token: str | None = Depends(oauth2_customer),
    db: Session = Depends(get_db),
) -> Customer | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("role") != "customer":
        return None
    cid = payload.get("sub")
    if cid is None:
        return None
    customer = db.get(Customer, int(cid))
    return customer if (customer and customer.is_active) else None


def get_current_customer(
    customer: Customer | None = Depends(get_optional_customer),
) -> Customer:
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return customer
