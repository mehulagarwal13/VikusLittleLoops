"""Idempotent migration for customer accounts.

Adds the columns introduced for customer login (Google + email) and order
linking to an EXISTING database. Safe to run multiple times.

Usage (from backend root, venv active):
    python -m scripts.migrate_accounts
"""
from sqlalchemy import text

from app.core.database import engine

STATEMENTS = [
    "ALTER TABLE customers ADD COLUMN IF NOT EXISTS google_id VARCHAR(64)",
    "ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_email VARCHAR(255)",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_customers_google_id ON customers (google_id)",
    "CREATE INDEX IF NOT EXISTS ix_orders_ship_email ON orders (ship_email)",
]


def run():
    with engine.begin() as conn:
        for stmt in STATEMENTS:
            conn.execute(text(stmt))
            print(f"✓ {stmt}")
    print("✓ Account migration complete.")


if __name__ == "__main__":
    run()
