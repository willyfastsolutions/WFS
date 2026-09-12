from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from app.core.database import engine, Base, SessionLocal
from app.models.models import Company, Profile, Machine, QuoteRequest
from app.services.auth import get_password_hash
from app.routers import auth, machinery, maintenance, companies, checklists, settings, quotes
from app.services.audit_worker import start_audit_daemon
from sqlalchemy import text

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WillyFastSolutions Telemetry Backend", version="1.0.0")

# High-performance payload compression for mobile / weak internet
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configure CORS to allow direct frontend queries (localhost, production and offline file pages)
allowed_origins = [
    "https://willyfastsolutions.com",
    "https://www.willyfastsolutions.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(machinery.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(checklists.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")

# Database Seeding function
def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed B2B Companies
        if db.query(Company).count() == 0:
            print("[SEED] Seeding B2B Companies...")
            apex = Company(id='a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name='Apex Logistics Corp')
            titan = Company(id='b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', name='Titan Mining Industries')
            db.add_all([apex, titan])
            db.commit()
            
        # 2. Seed User Profiles with Bcrypt Hash
        if db.query(Profile).count() == 0:
            print("[SEED] Seeding Admin Accounts...")
            pw_hash = get_password_hash("admin1234")
            
            apex_admin = Profile(
                id='11111111-1111-1111-1111-111111111111',
                company_id='a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                role='company_admin',
                full_name='Apex Admin',
                email='admin@apex.com',
                password_hash=pw_hash
            )
            titan_admin = Profile(
                id='22222222-2222-2222-2222-222222222222',
                company_id='b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
                role='company_admin',
                full_name='Titan Admin',
                email='admin@titan.com',
                password_hash=pw_hash
            )
            superadmin = Profile(
                id='33333333-3333-3333-3333-333333333333',
                company_id=None,
                role='superadmin',
                full_name='WillyFastSolutions Superadmin',
                email='admin@willyfastsolutions.com',
                password_hash=pw_hash
            )
            db.add_all([apex_admin, titan_admin, superadmin])
            db.commit()
            
        # 3. Seed Machinery Assets
        if db.query(Machine).count() == 0:
            print("[SEED] Seeding Fleet Machinery...")
            m1 = Machine(
                id='f1111111-1111-1111-1111-111111111111',
                company_id='a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                name='Apex Forklift 1',
                type='forklift',
                brand='Toyota',
                model='8FGU25',
                serial_number='SN-TOY-100234',
                current_hours=150.0,
                maintenance_threshold_hours=250.0,
                last_maintenance_hours=0.0
            )
            m2 = Machine(
                id='f1111111-2222-1111-1111-111111111111',
                company_id='a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                name='Apex Loader 1',
                type='skid_steer_loader',
                brand='Bobcat',
                model='S76',
                serial_number='SN-BOB-987211',
                current_hours=260.0,
                maintenance_threshold_hours=250.0,
                last_maintenance_hours=250.0
            )
            m3 = Machine(
                id='e2222222-1111-2222-2222-222222222222',
                company_id='b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
                name='Titan Excavator XL',
                type='excavator',
                brand='Caterpillar',
                model='320',
                serial_number='SN-CAT-554321',
                current_hours=480.0,
                maintenance_threshold_hours=250.0,
                last_maintenance_hours=200.0
            )
            db.add_all([m1, m2, m3])
            db.commit()
            
        # 4. Seed Checklist Templates & Items
        from app.models.models import ChecklistTemplate, ChecklistItem
        if db.query(ChecklistTemplate).count() == 0:
            print("[SEED] Seeding Checklist Templates & Items...")
            t_routine = ChecklistTemplate(
                id='temp_routine',
                name='Routine Services',
                description='Standard technical maintenance checklist items',
                company_id=None
            )
            t_safety = ChecklistTemplate(
                id='temp_safety',
                name='OSHA Safety Checks',
                description='Mandatory OSHA-compliant safety items',
                company_id=None
            )
            db.add_all([t_routine, t_safety])
            db.commit()

            # Seed Items
            items = [
                ChecklistItem(id='item_oil_change', template_id='temp_routine', label='Engine / Hydraulic Oil Change', category='routine'),
                ChecklistItem(id='item_oil_filter', template_id='temp_routine', label='Oil Filter Replacement', category='routine'),
                ChecklistItem(id='item_air_filter', template_id='temp_routine', label='Air Filter Replacement', category='routine'),
                ChecklistItem(id='item_spark_plugs', template_id='temp_routine', label='Spark / Glow Plugs Check', category='routine'),
                ChecklistItem(id='item_battery', template_id='temp_safety', label='Batteries Connections & Charge', category='safety'),
                ChecklistItem(id='item_lights', template_id='temp_safety', label='Working Lights & Alarm Signals', category='safety'),
                ChecklistItem(id='item_horn', template_id='temp_safety', label='Horn & Backup Alert Check', category='safety'),
                ChecklistItem(id='item_ignition', template_id='temp_safety', label='Ignition System & Controls', category='safety'),
                ChecklistItem(id='item_fuel', template_id='temp_safety', label='Fuel Lines & Injection Check', category='safety'),
                ChecklistItem(id='item_tires', template_id='temp_safety', label='Tires & structural integrity check', category='safety')
            ]
            db.add_all(items)
            db.commit()
            print("[SEED] Checklist Templates & Items seeded successfully!")
            
        print("[SEED] Database seeded successfully!")
    except Exception as e:
        print(f"[SEED] Error seeding database: {str(e)}")
    finally:
        db.close()

def run_migrations():
    db = SessionLocal()
    try:
        # Create table system_settings if not exists
        db.execute(text("CREATE TABLE IF NOT EXISTS system_settings (key VARCHAR(50) PRIMARY KEY, value VARCHAR(255) NOT NULL)"))
        
        # Create table audit_logs if not exists
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36),
                email VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            )
        """))
        print("[MIGRATION] Ensured audit_logs table exists.")

        # Create table quote_requests if not exists
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS quote_requests (
                id VARCHAR(36) PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            )
        """))
        print("[MIGRATION] Ensured quote_requests table exists.")
        
        # Check if warning_sent column exists
        cursor = db.execute(text("PRAGMA table_info(machinery)"))
        columns = [row[1] for row in cursor.fetchall()]
        if "warning_sent" not in columns:
            db.execute(text("ALTER TABLE machinery ADD COLUMN warning_sent BOOLEAN DEFAULT 0 NOT NULL"))
            print("[MIGRATION] Added warning_sent column to machinery table.")
        if "revoked" not in columns:
            db.execute(text("ALTER TABLE machinery ADD COLUMN revoked BOOLEAN DEFAULT 0 NOT NULL"))
            print("[MIGRATION] Added revoked column to machinery table.")

        # Check if must_change_password column exists in profiles
        cursor2 = db.execute(text("PRAGMA table_info(profiles)"))
        profile_columns = [row[1] for row in cursor2.fetchall()]
        if "must_change_password" not in profile_columns:
            try:
                db.execute(text("ALTER TABLE profiles ADD COLUMN must_change_password BOOLEAN DEFAULT 0 NOT NULL"))
                print("[MIGRATION] Added must_change_password column to profiles table.")
            except Exception:
                db.rollback()

        # Add maintenance_threshold column to companies table
        try:
            db.execute(text("ALTER TABLE companies ADD COLUMN maintenance_threshold FLOAT"))
            db.commit()
            print("[MIGRATION] Added maintenance_threshold column to companies table.")
        except Exception:
            db.rollback()
            
        # Seed default configs if not present
        from app.models.models import SystemSetting
        if db.query(SystemSetting).filter(SystemSetting.key == "scan_interval_seconds").count() == 0:
            db.add(SystemSetting(key="scan_interval_seconds", value="86400"))
            print("[SEED] Seeded default scan_interval_seconds = 86400")
        if db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").count() == 0:
            db.add(SystemSetting(key="default_maintenance_threshold", value="250.0"))
        # Optimize PostgreSQL queries with B-Tree indexes on foreign keys & search columns
        indexes_to_create = [
            ("idx_machinery_company_id", "machinery", "company_id"),
            ("idx_machinery_revoked", "machinery", "revoked"),
            ("idx_profiles_company_id", "profiles", "company_id"),
            ("idx_profiles_email", "profiles", "email"),
            ("idx_maintenance_logs_machinery_id", "maintenance_logs", "machinery_id"),
            ("idx_hour_logs_machinery_id", "hour_logs", "machinery_id"),
            ("idx_checklist_templates_company_id", "checklist_templates", "company_id"),
            ("idx_checklist_items_template_id", "checklist_items", "template_id"),
            ("idx_checklist_results_log_id", "maintenance_checklist_results", "maintenance_log_id"),
            ("idx_audit_logs_user_id", "audit_logs", "user_id"),
            ("idx_audit_logs_created_at", "audit_logs", "created_at"),
        ]
        for idx_name, tbl_name, col_name in indexes_to_create:
            try:
                db.execute(text(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {tbl_name} ({col_name})"))
                db.commit()
            except Exception:
                db.rollback()

        db.commit()
    except Exception as ex:
        print(f"[MIGRATION] Error running schema updates: {str(ex)}")
    finally:
        db.close()

# Run migrations
run_migrations()

# Run Seeding
seed_database()

# Start background auditing worker loop (runs as daemon thread)
start_audit_daemon()

@app.get("/")
def welcome():
    return {
        "message": "Welcome to WillyFastSolutions Telemetry Backend API Node!",
        "status": "online",
        "worker_daemon": "active"
    }
