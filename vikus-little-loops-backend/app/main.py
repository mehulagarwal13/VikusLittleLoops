from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, auth, catalog, customer, misc, orders, products, uploads
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Backend API for Viku's Little Loops — handmade luxury crochet boutique.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix=settings.API_PREFIX)
api.include_router(auth.router)
api.include_router(customer.router)
api.include_router(products.router)
api.include_router(catalog.router)
api.include_router(misc.router)
api.include_router(orders.router)
api.include_router(uploads.router)
api.include_router(admin.router)
app.include_router(api)


@app.get("/", tags=["health"])
def root():
    return {"name": settings.PROJECT_NAME, "status": "ok", "docs": "/docs"}


@app.get(f"{settings.API_PREFIX}/health", tags=["health"])
def health():
    return {"status": "healthy"}
