import time
import threading
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Machine, Company, Profile
from app.services.pdf_generator import generate_machinery_pdf
from app.services.email_worker import send_alert_email

# In-memory registry to prevent duplicate warning spam
already_warned = set()
worker_running = False

def run_audit_cycle():
    db: Session = SessionLocal()
    try:
        # Query all machinery
        machines = db.query(Machine).all()
        for machine in machines:
            hours_since_pm = machine.current_hours - machine.last_maintenance_hours
            is_overdue = hours_since_pm >= machine.maintenance_threshold_hours
            
            if is_overdue:
                if machine.id not in already_warned:
                    # Get company details
                    company = db.query(Company).filter(Company.id == machine.company_id).first()
                    comp_name = company.name if company else "Unknown B2B Tenant"
                    
                    # Find admin email for this company
                    admin = db.query(Profile).filter(Profile.company_id == machine.company_id, Profile.role == "company_admin").first()
                    admin_email = admin.email if admin else "manager@willyfastsolutions.com"
                    
                    # Generate report path in backend/reports/
                    report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
                    os.makedirs(report_dir, exist_ok=True)
                    report_path = os.path.abspath(os.path.join(report_dir, f"report_{machine.serial_number}.pdf"))
                    
                    print(f"\n[WORKER DAEMON] threshold breach detected for {machine.name} ({hours_since_pm:.1f}h since last PM).")
                    print(f"[WORKER DAEMON] Generating PDF report at: {report_path}...")
                    
                    # Generate the PDF
                    generate_machinery_pdf(
                        machine_name=machine.name,
                        brand=machine.brand,
                        model=machine.model,
                        serial=machine.serial_number,
                        current_hours=machine.current_hours,
                        last_hours=machine.last_maintenance_hours,
                        limit_hours=machine.maintenance_threshold_hours,
                        company_name=comp_name,
                        output_path=report_path,
                        photo_base64=machine.photo
                    )
                    
                    # Build Email Contents
                    subject = f"URGENT: Maintenance Warning - {machine.name} ({machine.serial_number})"
                    body = f"""
                    <html>
                    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                        <h2 style="color: #d9534f;">Preventive Maintenance Threshold Warning</h2>
                        <p>Dear Administrator of <b>{comp_name}</b>,</p>
                        <p>Our telemetry system has identified that the B2B asset <b>{machine.name}</b> (Serial: <b>{machine.serial_number}</b>) has operated for <b>{hours_since_pm:.1f} hours</b> since its last scheduled service.</p>
                        <p>This exceeds the maximum allowed safety threshold of <b>{machine.maintenance_threshold_hours:.1f} hours</b>.</p>
                        <p>We have automatically generated a comprehensive executive audit report and attached it to this email. Please schedule a certified technician to complete the safety check and reset the horómetro immediately.</p>
                        <br>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p style="font-size: 11px; color: #777;">WillyFastSolutions Telemetry Daemon Service - Local PC Node</p>
                    </body>
                    </html>
                    """
                    
                    sent = send_alert_email(
                        to_email=admin_email,
                        subject=subject,
                        body_text=body,
                        attachment_path=report_path
                    )
                    
                    if sent:
                        already_warned.add(machine.id)
                        print(f"[WORKER DAEMON] Warning dispatched successfully to {admin_email}.\n")
            else:
                # If hours have been reset below threshold, remove warning flag
                if machine.id in already_warned:
                    already_warned.remove(machine.id)
                    print(f"[WORKER DAEMON] Machine {machine.name} hours reset. Warning state cleared.")
    except Exception as e:
        print(f"[WORKER DAEMON] Error in audit cycle: {str(e)}")
    finally:
        db.close()

def audit_daemon_loop(interval_seconds: int = 15):
    global worker_running
    print(f"[WORKER DAEMON] Starting telemetry polling loop every {interval_seconds} seconds...")
    worker_running = True
    while worker_running:
        run_audit_cycle()
        time.sleep(interval_seconds)

def start_audit_daemon():
    thread = threading.Thread(target=audit_daemon_loop, daemon=True)
    thread.start()
    return thread
