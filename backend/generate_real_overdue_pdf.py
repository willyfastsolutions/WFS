import os
import sqlite3
import base64
import sys

# Add backend dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.audit_worker import run_audit_cycle

def main():
    print("Populating SQLite database with a real forklift photo...")
    
    # Paths
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, "willyfast.db")
    forklift_img_path = r"C:\Users\david\.gemini\antigravity\brain\73e89d48-1471-4eb3-b8db-aad6580c3bbd\industrial_forklift_1780706601603.png"
    
    if not os.path.exists(forklift_img_path):
        print(f"Error: Forklift image artifact not found at {forklift_img_path}")
        return
        
    # Read and encode forklift image in Base64
    with open(forklift_img_path, "rb") as img_file:
        img_b64 = base64.b64encode(img_file.read()).decode("utf-8")
        photo_field_value = f"data:image/png;base64,{img_b64}"
        
    # Connect to local SQLite DB and update Apex Forklift 1
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Update hours to make it overdue (310.0 hrs total, 0.0 last PM = 310h > 250h)
    # 2. Update photo with base64 forklift image
    cursor.execute("""
        UPDATE machinery
        SET current_hours = 310.0, photo = ?
        WHERE id = 'f1111111-1111-1111-1111-111111111111'
    """, (photo_field_value,))
    
    conn.commit()
    conn.close()
    print("Database successfully updated. Apex Forklift 1 is now overdue and has a real forklift photo.")
    
    # Trigger the real daemon audit cycle to scan DB and compile the PDF
    print("Triggering backend daemon audit cycle...")
    run_audit_cycle()
    
    print("\nCheck reports directory for the compiled PDF:")
    report_pdf = os.path.join(backend_dir, "reports", "report_SN-TOY-100234.pdf")
    if os.path.exists(report_pdf):
        print(f"Generated PDF path: {report_pdf}")
    else:
        print("Error generating PDF.")

if __name__ == "__main__":
    main()
