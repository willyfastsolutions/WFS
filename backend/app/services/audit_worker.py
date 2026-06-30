import time
import threading
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Machine, Company, Profile
from app.services.pdf_generator import generate_machinery_pdf
from app.services.email_worker import send_alert_email

# In-memory registry to prevent duplicate warning spam
worker_running = False
settings_changed_event = threading.Event()

def run_audit_cycle():
    db: Session = SessionLocal()
    summary = []
    try:
        # Query only active (non-revoked) machinery
        machines = db.query(Machine).filter(Machine.revoked == False).all()
        for machine in machines:
            # Query company to get its custom maintenance_threshold
            company = db.query(Company).filter(Company.id == machine.company_id).first()
            comp_name = company.name if company else "Unknown B2B Tenant"
            
            # Resolve threshold hierarchy: company threshold -> machine threshold -> default (250.0)
            threshold = 250.0
            if company and company.maintenance_threshold is not None:
                threshold = company.maintenance_threshold
            elif machine.maintenance_threshold_hours is not None:
                threshold = machine.maintenance_threshold_hours
                
            hours_since_pm = machine.current_hours - machine.last_maintenance_hours
            is_overdue = hours_since_pm >= threshold
            
            email_sent = False
            admin_email = None
            
            if is_overdue:
                # Find admin email for this company
                admin = db.query(Profile).filter(Profile.company_id == machine.company_id, Profile.role == "company_admin").first()
                admin_email = admin.email if admin else "manager@willyfastsolutions.com"
                
                if not machine.warning_sent:
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
                        limit_hours=threshold,
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
                        <p>This exceeds the maximum allowed safety threshold of <b>{threshold:.1f} hours</b>.</p>
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
                        machine.warning_sent = True
                        db.commit()
                        email_sent = True
                        print(f"[WORKER DAEMON] Warning dispatched successfully to {admin_email}.\n")
            else:
                # If hours have been reset below threshold, remove warning flag
                if machine.warning_sent:
                    machine.warning_sent = False
                    db.commit()
                    print(f"[WORKER DAEMON] Machine {machine.name} hours reset. Warning state cleared.")
            
            summary.append({
                "machine_id": str(machine.id),
                "machine_name": machine.name,
                "serial_number": machine.serial_number,
                "company_name": comp_name,
                "current_hours": float(machine.current_hours),
                "hours_since_pm": float(hours_since_pm),
                "threshold": float(threshold),
                "is_overdue": bool(is_overdue),
                "warning_already_sent": bool(machine.warning_sent and not email_sent),
                "email_sent_this_run": bool(email_sent),
                "recipient": admin_email
            })
    except Exception as e:
        print(f"[WORKER DAEMON] Error in audit cycle: {str(e)}")
        raise e
    finally:
        db.close()
    return summary


def get_next_sleep_seconds():
    import datetime
    from app.models.models import SystemSetting
    db = SessionLocal()
    
    # Fallbacks
    scan_mode = "interval"
    interval_seconds = 86400
    daily_time_str = "12:00"
    
    try:
        mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_mode").first()
        if mode_setting:
            scan_mode = mode_setting.value
            
        interval_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_interval_seconds").first()
        if interval_setting:
            try:
                interval_seconds = int(interval_setting.value)
            except ValueError:
                pass
                
        daily_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_daily_time").first()
        if daily_setting:
            daily_time_str = daily_setting.value
            
        now = datetime.datetime.now()
        
        if scan_mode == "daily":
            parts = daily_time_str.split(":")
            target_hour = int(parts[0]) if len(parts) > 0 else 12
            target_minute = int(parts[1]) if len(parts) > 1 else 0
            
            target_time = now.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
            if target_time <= now:
                target_time += datetime.timedelta(days=1)
                
            sleep_secs = (target_time - now).total_seconds()
            print(f"[WORKER DAEMON] Mode: Daily. Next run scheduled for {target_time.strftime('%Y-%m-%d %H:%M:%S')} (sleeping {sleep_secs:.1f}s)")
            return max(1.0, sleep_secs)
            
        else: # interval mode aligned to standard hour boundaries
            interval_hours = max(1, round(interval_seconds / 3600))
            
            # Align to the next exact hour
            next_time = now.replace(minute=0, second=0, microsecond=0) + datetime.timedelta(hours=1)
            
            if interval_hours > 1:
                # Align next_time.hour to be a multiple of interval_hours
                while next_time.hour % interval_hours != 0:
                    next_time += datetime.timedelta(hours=1)
                    
            if next_time <= now:
                next_time += datetime.timedelta(hours=interval_hours)
                
            sleep_secs = (next_time - now).total_seconds()
            print(f"[WORKER DAEMON] Mode: Interval. Next run scheduled for {next_time.strftime('%Y-%m-%d %H:%M:%S')} (sleeping {sleep_secs:.1f}s)")
            return max(1.0, sleep_secs)
            
    except Exception as e:
        print(f"[WORKER DAEMON] Error calculating scheduler sleep seconds: {str(e)}")
        return 3600
    finally:
        db.close()

def audit_daemon_loop():
    global worker_running
    print(f"[WORKER DAEMON] Starting telemetry polling loop...")
    worker_running = True
    while worker_running:
        # Run audit scan cycle
        try:
            run_audit_cycle()
        except Exception as err:
            print(f"[WORKER DAEMON] Error executing run_audit_cycle: {str(err)}")
            
        # Get next calculated sleep interval
        sleep_interval = get_next_sleep_seconds()
        
        # Sleep until the next scheduled run or settings change interrupt
        settings_changed_event.clear()
        interrupted = settings_changed_event.wait(timeout=sleep_interval)
        if interrupted:
            print("[WORKER DAEMON] Settings change detected! Rescheduling immediately.")


def start_audit_daemon():
    thread = threading.Thread(target=audit_daemon_loop, daemon=True)
    thread.start()
    return thread
