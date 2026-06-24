# -*- coding: utf-8 -*-
import sys
import os
import uuid

# Add current directory to path so it can find app/
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.models import Profile, Company, Machine
from app.services import machinery as machinery_service
from app.services.auth import get_password_hash, verify_password
from app.schemas.schemas import MachineUpdate

def main():
    print("Starting Phase 6 local backend verification...")
    db = SessionLocal()
    
    try:
        # 1. Test B2B User Management operations directly on db
        print("\n[Test 1] Testing user profile CRUD operations...")
        
        # Get or create test company
        company = db.query(Company).filter(Company.name == "Test Company Ltd").first()
        if not company:
            company = Company(id=str(uuid.uuid4()), name="Test Company Ltd", active=True)
            db.add(company)
            db.commit()
            db.refresh(company)
        print(f"Using company: {company.name} (ID: {company.id})")
        
        # Create user
        email = f"operator-{uuid.uuid4().hex[:6]}@customdomain.com"
        password = "Operator1234@"
        user = Profile(
            id=str(uuid.uuid4()),
            company_id=company.id,
            role="company_admin",
            full_name="B2B Operator Test",
            email=email,
            password_hash=get_password_hash(password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created User: {user.full_name} with email: {user.email}")
        
        # Verify password hash works
        if verify_password(password, user.password_hash):
            print("Password verification: SUCCESS")
        else:
            print("Password verification: FAILED")
            sys.exit(1)
            
        # Update user
        new_name = "B2B Operator Updated Name"
        user.full_name = new_name
        db.commit()
        db.refresh(user)
        print(f"Updated User Name: {user.full_name}")
        if user.full_name == new_name:
            print("User update: SUCCESS")
        else:
            print("User update: FAILED")
            sys.exit(1)
            
        # Delete user
        db.delete(user)
        db.commit()
        deleted_user = db.query(Profile).filter(Profile.id == user.id).first()
        if not deleted_user:
            print("User deletion: SUCCESS")
        else:
            print("User deletion: FAILED")
            sys.exit(1)
            
        # 2. Test Machinery Update operations (including photo)
        print("\n[Test 2] Testing machinery update service method...")
        
        # Create a test machine
        machine = Machine(
            id=str(uuid.uuid4()),
            company_id=company.id,
            name="Test Excavator 99",
            type="excavator",
            brand="Volvo",
            model="EC220",
            serial_number=f"SN-VOLVO-{uuid.uuid4().hex[:6].upper()}",
            current_hours=10.0,
            maintenance_threshold_hours=250.0,
            last_maintenance_hours=0.0
        )
        db.add(machine)
        db.commit()
        db.refresh(machine)
        print(f"Created Machine: {machine.name} (ID: {machine.id})")
        
        # Update machine using update_machine service method
        update_schema = MachineUpdate(
            name="Test Excavator 99 Updated",
            brand="Volvo-Updated",
            model="EC220D",
            serial_number=machine.serial_number,
            photo="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        updated_machine = machinery_service.update_machine(db, machine.id, update_schema)
        
        print(f"Updated Machine Name: {updated_machine.name}")
        print(f"Updated Machine Brand: {updated_machine.brand}")
        print(f"Updated Machine Model: {updated_machine.model}")
        print(f"Has photo in db: {updated_machine.photo is not None} (Len: {len(updated_machine.photo) if updated_machine.photo else 0})")
        
        if (updated_machine.name == "Test Excavator 99 Updated" and 
            updated_machine.brand == "Volvo-Updated" and 
            updated_machine.photo is not None):
            print("Machinery update: SUCCESS")
        else:
            print("Machinery update: FAILED")
            sys.exit(1)
            
        # Clean up test machine and company
        db.delete(updated_machine)
        db.delete(company)
        db.commit()
        print("\nCleaned up all test data from SQLite database successfully.")
        print("\nPhase 6 database service operations validated successfully!")
        
    except Exception as e:
        print(f"Error during verification: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
