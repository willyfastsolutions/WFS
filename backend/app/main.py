from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.models.models import Company, Profile, Machine
from app.services.auth import get_password_hash
from app.routers import auth, machinery, maintenance, companies, checklists, settings
from app.services.audit_worker import start_audit_daemon
from sqlalchemy import text

# Create SQLite Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WillyFastSolutions Telemetry Backend", version="1.0.0")

# Configure CORS to allow direct frontend queries (localhost and offline file pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            db.execute(text("ALTER TABLE profiles ADD COLUMN must_change_password BOOLEAN DEFAULT 0 NOT NULL"))
            print("[MIGRATION] Added must_change_password column to profiles table.")
            
        # Seed default configs if not present
        from app.models.models import SystemSetting
        if db.query(SystemSetting).filter(SystemSetting.key == "scan_interval_seconds").count() == 0:
            db.add(SystemSetting(key="scan_interval_seconds", value="86400"))
            print("[SEED] Seeded default scan_interval_seconds = 86400")
        if db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").count() == 0:
            db.add(SystemSetting(key="default_maintenance_threshold", value="250.0"))
            print("[SEED] Seeded default default_maintenance_threshold = 250.0")
            
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
