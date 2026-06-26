# -*- coding: utf-8 -*-
import sys
import os
import uuid

# Add current directory to path so it can find app/
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.models import Profile, Company, Machine
from app.services import machinery as machinery_service
from app.schemas.schemas import MachineCreate
from fastapi import HTTPException
from app.routers.machinery import create_machine

def main():
    print("Starting Machinery Hours & Admin Mismatch verification...")
    db = SessionLocal()
    
    try:
        # Create a mock company
        company_id = str(uuid.uuid4())
        company = Company(id=company_id, name="Test Company B2B", active=True)
        db.add(company)
        db.commit()
        db.refresh(company)
        print(f"Created company: {company.name} (ID: {company.id})")
        
        # Test 1: Service layer should allow registering machinery with > 250 hours (e.g., 1234.0)
        print("\n[Test 1] Testing add_machine service layer with 1234.0 hours...")
        schema = MachineCreate(
            company_id=company_id,
            name="Test High Hours Forklift",
            type="forklift",
            brand="Toyota",
            model="EC-1234",
            serial_number=f"SN-{uuid.uuid4().hex[:6].upper()}",
            current_hours=1234.0,
            maintenance_threshold_hours=250.0,
            photo=None
        )
        
        # This would fail prior to our changes
        machine = machinery_service.add_machine(db, schema)
        print(f"Successfully registered machine: {machine.name} (ID: {machine.id})")
        print(f"Current Hours: {machine.current_hours}")
        print(f"Last Maintenance Hours: {machine.last_maintenance_hours}")
        
        assert machine.current_hours == 1234.0, "Current hours mismatch"
        assert machine.last_maintenance_hours == 1234.0, "Last maintenance hours (baseline) must be set to current_hours!"
        print("Test 1: SUCCESS")

        # Test 2: Verify the router's permission check for company_id string-vs-UUID/str comparisons
        print("\n[Test 2] Testing router create_machine with mock user...")
        
        # Create a mock profile where company_id is a UUID object (as it behaves in production PostgreSQL)
        class MockUser:
            def __init__(self, c_id):
                self.id = "mock-user-id"
                self.email = "mock@domain.com"
                self.role = "company_admin"
                self.company_id = uuid.UUID(c_id) # Explicitly a UUID object
            
        mock_user = MockUser(company_id)
        
        try:
            res = create_machine(machine=schema, db=db, current_user=mock_user)
            print(f"Router creation success! Registered Machine ID: {res.id}")
            print("Test 2: SUCCESS")
            
            # Clean up the machine created by router call
            db.delete(res)
        except HTTPException as e:
            print(f"Router creation failed with HTTPException: {e.status_code} - {e.detail}")
            assert False, f"Router rejected registration even though company IDs represent the same UUID value: {e.detail}"
            
        # Clean up Test 1 data
        db.delete(machine)
        db.delete(company)
        db.commit()
        print("\nAll database changes successfully cleaned up.")
        print("\nLocal verification completed successfully!")
        
    except Exception as e:
        print(f"\nVerification failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
