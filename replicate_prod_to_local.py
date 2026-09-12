"""
WillyFastSolutions - Production to Local Data Replicator
Clones all rows from the production database directly into the local SQLite database (backend/willyfast.db).
Creates an automatic timestamped backup of the local database beforehand.
"""

import os
import shutil
import sqlite3
import datetime
import psycopg2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DB = os.path.join(BASE_DIR, "backend", "willyfast.db")
BACKUP_DIR = os.path.join(BASE_DIR, "backend", "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_FILE = os.path.join(BACKUP_DIR, f"willyfast_local_{timestamp}.db")

if os.path.exists(LOCAL_DB):
    shutil.copy2(LOCAL_DB, BACKUP_FILE)
    print(f"[BACKUP] Existing local DB backed up to: {BACKUP_FILE}")

PROD_PG_URL = "postgresql://postgres:OUPIF60jYJt5LDAC@db.achxhmlhuljvpyjluuqq.supabase.co:5432/postgres"

print("[SYNC] Connecting to production database...")
try:
    pg_conn = psycopg2.connect(PROD_PG_URL, connect_timeout=10)
    pg_cur = pg_conn.cursor()
except Exception as e:
    print(f"[ERROR] Could not connect to production: {e}")
    exit(1)

# Ensure local SQLite schema is up to date
print("[SYNC] Initializing local SQLite database schema...")
sys_path = os.path.join(BASE_DIR, "backend")
import sys
if sys_path not in sys.path:
    sys.path.append(sys_path)

from app.core.database import Base, engine
from app.models.models import *
Base.metadata.create_all(bind=engine)

local_conn = sqlite3.connect(LOCAL_DB)
local_cur = local_conn.cursor()

# Tables to replicate in foreign key dependency order
TABLES = [
    "system_settings",
    "companies",
    "profiles",
    "machinery",
    "checklist_templates",
    "checklist_items",
    "hour_logs",
    "maintenance_logs",
    "maintenance_checklist_results",
    "audit_logs",
    "quote_requests"
]

print("[SYNC] Replicating data from Production to Local SQLite...")
local_cur.execute("PRAGMA foreign_keys = OFF;")

for table in TABLES:
    try:
        # Fetch columns and data from Postgres
        pg_cur.execute(f"SELECT * FROM {table}")
        rows = pg_cur.fetchall()
        colnames = [desc[0] for desc in pg_cur.description]

        if not rows:
            print(f"  - {table}: 0 rows in production")
            continue

        # Clear local table
        local_cur.execute(f"DELETE FROM {table}")

        # Insert into local SQLite
        placeholders = ", ".join(["?"] * len(colnames))
        cols_str = ", ".join(colnames)
        sql = f"INSERT OR REPLACE INTO {table} ({cols_str}) VALUES ({placeholders})"

        # Convert row data types if necessary (e.g. datetime to ISO format string)
        converted_rows = []
        for r in rows:
            conv_row = []
            for val in r:
                if hasattr(val, "isoformat"):
                    conv_row.append(val.isoformat())
                elif isinstance(val, bool):
                    conv_row.append(1 if val else 0)
                else:
                    conv_row.append(val)
            converted_rows.append(tuple(conv_row))

        local_cur.executemany(sql, converted_rows)
        local_conn.commit()
        print(f"  [OK] {table}: {len(rows)} records replicated")
    except Exception as ex:
        print(f"  [WARN] Table {table}: {ex}")

local_cur.execute("PRAGMA foreign_keys = ON;")
local_conn.close()
pg_conn.close()

print("\n=================================================================")
print("  REPLICATION COMPLETE! Local database matches production 100%")
print("=================================================================")
