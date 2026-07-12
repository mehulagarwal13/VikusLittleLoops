"""Ensure the database tables and admin login exist — nothing else.

Safe to run on every deploy (as a Railway pre-deploy step):
- Creates any missing tables (never touches existing data).
- Creates the admin from FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD if missing.
- If the admin already exists, resets its password to FIRST_ADMIN_PASSWORD,
  so the env credentials ALWAYS work after a deploy.
- Adds no sample products / categories / reviews.

Usage:
    python -m scripts.ensure_admin
"""
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.admin import Admin

# Import all model modules so create_all knows every table.
from app.models import catalog, commerce, content  # noqa: F401


def main() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.email == settings.FIRST_ADMIN_EMAIL).first()
        if admin:
            admin.hashed_password = hash_password(settings.FIRST_ADMIN_PASSWORD)
            admin.is_active = True
            print(f"Admin exists — password synced to env: {settings.FIRST_ADMIN_EMAIL}")
        else:
            db.add(
                Admin(
                    name="Admin",
                    email=settings.FIRST_ADMIN_EMAIL,
                    hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                    is_active=True,
                    is_superadmin=True,
                )
            )
            print(f"Admin created: {settings.FIRST_ADMIN_EMAIL}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
