from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.models.models import Company, Profile, Machine
from app.services.auth import get_password_hash
from app.routers import auth, machinery, maintenance
from app.services.audit_worker import start_audit_daemon

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

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(machinery.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")

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
                email='support@willyfastsolutions.com',
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
