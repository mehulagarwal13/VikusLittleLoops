"""One-time migration for the reviews table:
1. Adds the photo_url column (customer photos).
2. Makes product_id optional (general reviews not tied to a product).

Safe to run multiple times.

Usage (Railway backend Console):
    python -m scripts.update_reviews_table
"""
from sqlalchemy import text

from app.core.database import engine


def main() -> None:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)"))
        conn.execute(text("ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL"))
        conn.commit()
    print("Done — reviews table updated (photo_url + optional product).")


if __name__ == "__main__":
    main()
