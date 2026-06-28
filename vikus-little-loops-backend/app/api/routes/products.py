from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.admin import Admin
from app.models.catalog import Inventory, Product, ProductImage, ProductVariant
from app.schemas.catalog import (
    Paginated,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])

_loaders = (
    selectinload(Product.images),
    selectinload(Product.variants),
    selectinload(Product.category),
)


# ---------------- Public ----------------
@router.get("", response_model=Paginated)
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    category_id: int | None = None,
    collection_id: int | None = None,
    search: str | None = None,
    featured: bool | None = None,
    trending: bool | None = None,
    best_seller: bool | None = None,
    new_arrival: bool | None = None,
    in_stock: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = Query("featured", pattern="^(featured|newest|price_asc|price_desc|best_selling)$"),
):
    stmt = select(Product).where(Product.is_published.is_(True))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if collection_id:
        stmt = stmt.where(Product.collection_id == collection_id)
    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))
    if featured is not None:
        stmt = stmt.where(Product.is_featured.is_(featured))
    if trending is not None:
        stmt = stmt.where(Product.is_trending.is_(trending))
    if best_seller is not None:
        stmt = stmt.where(Product.is_best_seller.is_(best_seller))
    if new_arrival is not None:
        stmt = stmt.where(Product.is_new_arrival.is_(new_arrival))
    if in_stock:
        stmt = stmt.where(Product.stock > 0)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)

    if sort == "price_asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort == "newest":
        stmt = stmt.order_by(Product.created_at.desc())
    elif sort == "best_selling":
        stmt = stmt.order_by(Product.is_best_seller.desc(), Product.created_at.desc())
    else:  # featured
        stmt = stmt.order_by(Product.is_featured.desc(), Product.created_at.desc())

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.options(selectinload(Product.images), selectinload(Product.category))
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return Paginated(items=rows, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).options(*_loaders).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ---------------- Admin ----------------
@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    if db.scalar(select(Product).where(Product.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Slug already exists")

    data = payload.model_dump(exclude={"images", "variants"})
    product = Product(**data)
    db.add(product)
    db.flush()  # get product.id

    for img in payload.images:
        db.add(ProductImage(product_id=product.id, **img.model_dump()))

    for v in payload.variants:
        vdata = v.model_dump()
        qty = vdata.pop("quantity", 0)
        variant = ProductVariant(product_id=product.id, **vdata)
        db.add(variant)
        db.flush()
        db.add(Inventory(variant_id=variant.id, quantity=qty))

    db.commit()
    db.refresh(product)
    product = db.scalar(select(Product).options(*_loaders).where(Product.id == product.id))
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    data = payload.model_dump(exclude_unset=True)
    new_images = data.pop("images", None)
    for field, value in data.items():
        setattr(product, field, value)

    # Replace the full image set when provided.
    if new_images is not None:
        for img in list(product.images):
            db.delete(img)
        db.flush()
        for i, img in enumerate(new_images):
            payload_img = {**img, "sort_order": img.get("sort_order", i)}
            db.add(ProductImage(product_id=product.id, **payload_img))

    db.commit()
    product = db.scalar(select(Product).options(*_loaders).where(Product.id == product_id))
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
