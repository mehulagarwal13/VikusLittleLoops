from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    emoji: str | None = None
    is_active: bool = True
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    emoji: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CategoryMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    emoji: str | None = None


# ---------- SubCategory ----------
class SubCategoryBase(BaseModel):
    name: str
    slug: str
    category_id: int
    is_active: bool = True


class SubCategoryCreate(SubCategoryBase):
    pass


class SubCategoryOut(SubCategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Collection ----------
class CollectionBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    is_featured: bool = False


class CollectionCreate(CollectionBase):
    pass


class CollectionOut(CollectionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Color / Size ----------
class ColorCreate(BaseModel):
    name: str
    slug: str
    hex_code: str | None = None


class ColorOut(ColorCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SizeCreate(BaseModel):
    name: str
    label: str | None = None
    sort_order: int = 0


class SizeOut(SizeCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Product images / variants ----------
class ProductImageIn(BaseModel):
    url: str
    public_id: str | None = None
    alt_text: str | None = None
    is_primary: bool = False
    sort_order: int = 0


class ProductImageOut(ProductImageIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProductVariantIn(BaseModel):
    color_id: int | None = None
    size_id: int | None = None
    sku: str | None = None
    price_override: Decimal | None = None
    quantity: int = 0


class ProductVariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    color_id: int | None = None
    size_id: int | None = None
    sku: str | None = None
    price_override: Decimal | None = None


# ---------- Product ----------
class ProductBase(BaseModel):
    name: str
    slug: str
    short_description: str | None = None
    long_description: str | None = None
    price: Decimal
    discount_percent: int = 0
    sku: str | None = None
    stock: int = 0
    category_id: int | None = None
    subcategory_id: int | None = None
    collection_id: int | None = None
    tags: list[str] = []
    material: str | None = None
    weight: str | None = None
    dimensions: str | None = None
    care_instructions: str | None = None
    is_featured: bool = False
    is_trending: bool = False
    is_best_seller: bool = False
    is_new_arrival: bool = False
    is_published: bool = True
    meta_title: str | None = None
    meta_description: str | None = None
    alt_text: str | None = None


class ProductCreate(ProductBase):
    images: list[ProductImageIn] = []
    variants: list[ProductVariantIn] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    short_description: str | None = None
    long_description: str | None = None
    price: Decimal | None = None
    discount_percent: int | None = None
    sku: str | None = None
    stock: int | None = None
    category_id: int | None = None
    subcategory_id: int | None = None
    collection_id: int | None = None
    tags: list[str] | None = None
    material: str | None = None
    weight: str | None = None
    dimensions: str | None = None
    care_instructions: str | None = None
    is_featured: bool | None = None
    is_trending: bool | None = None
    is_best_seller: bool | None = None
    is_new_arrival: bool | None = None
    is_published: bool | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    alt_text: str | None = None
    # When provided on update, replaces the full image set.
    images: list[ProductImageIn] | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: CategoryMini | None = None
    images: list[ProductImageOut] = []
    variants: list[ProductVariantOut] = []


class ProductListOut(BaseModel):
    """Lightweight shape for grids."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    price: Decimal
    discount_percent: int
    short_description: str | None = None
    stock: int
    is_featured: bool
    is_trending: bool
    is_best_seller: bool
    is_new_arrival: bool
    category: CategoryMini | None = None
    images: list[ProductImageOut] = []


class Paginated(BaseModel):
    items: list[ProductListOut]
    total: int
    page: int
    page_size: int
