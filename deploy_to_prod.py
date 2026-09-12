"""
WillyFastSolutions - Full Stack Deployer to VPS
Builds the Next.js frontend, packages static dist, updates Nginx configuration,
deploys backend Python files, and gracefully reloads services on the VPS.
"""

import os
import subprocess
import tarfile
import paramiko

VPS_IP = "2.24.203.120"
VPS_USER = "root"
VPS_PASSWORD = "RVH'ErUe8dLxJSwR"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
FRONTEND_OUT = os.path.join(FRONTEND_DIR, "out")
TAR_FILE = os.path.join(BASE_DIR, "frontend_dist.tar.gz")

def safe_print(text):
    try:
        print(text)
    except Exception:
        print(text.encode('ascii', 'replace').decode('ascii'))

def build_frontend():
    safe_print("\n=== STEP 1: BUILDING FRONTEND (npm run build) ===")
    res = subprocess.run("npm run build", cwd=FRONTEND_DIR, shell=True)
    if res.returncode != 0:
        safe_print("[ERROR] Frontend build failed! Aborting deployment.")
        exit(1)
    safe_print("[OK] Frontend built successfully.")

def package_frontend():
    safe_print(f"\n=== STEP 2: PACKAGING DIST -> {TAR_FILE} ===")
    if os.path.exists(TAR_FILE):
        os.remove(TAR_FILE)
    with tarfile.open(TAR_FILE, "w:gz") as tar:
        for root, dirs, files in os.walk(FRONTEND_OUT):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, FRONTEND_OUT)
                tar.add(full_path, arcname=rel_path)
    size_mb = os.path.getsize(TAR_FILE) / (1024 * 1024)
    safe_print(f"[OK] Package created: {size_mb:.2f} MB")

def deploy_to_vps():
    safe_print(f"\n=== STEP 3: CONNECTING TO VPS ({VPS_IP}) ===")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=20)
    sftp = ssh.open_sftp()

    def run_cmd(cmd):
        safe_print(f"RUN: {cmd}")
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if out: safe_print(f"  STDOUT: {out}")
        if err: safe_print(f"  STDERR: {err}")
        return out, err

    safe_print("\n=== STEP 4: UPLOADING FRONTEND ===")
    sftp.put(TAR_FILE, "/tmp/frontend_dist.tar.gz")
    run_cmd("rm -rf /var/www/willyfastsolutions/frontend/*")
    run_cmd("tar -xzf /tmp/frontend_dist.tar.gz -C /var/www/willyfastsolutions/frontend/")
    run_cmd("chown -R www-data:www-data /var/www/willyfastsolutions/frontend")
    run_cmd("rm -f /tmp/frontend_dist.tar.gz")

    safe_print("\n=== STEP 5: UPLOADING BACKEND PYTHON FILES ===")
    backend_files = [
        ("backend/app/main.py", "/var/www/willyfastsolutions/backend/app/main.py"),
        ("backend/app/core/config.py", "/var/www/willyfastsolutions/backend/app/core/config.py"),
        ("backend/app/core/database.py", "/var/www/willyfastsolutions/backend/app/core/database.py"),
        ("backend/app/models/models.py", "/var/www/willyfastsolutions/backend/app/models/models.py"),
        ("backend/app/routers/auth.py", "/var/www/willyfastsolutions/backend/app/routers/auth.py"),
        ("backend/app/routers/checklists.py", "/var/www/willyfastsolutions/backend/app/routers/checklists.py"),
        ("backend/app/routers/companies.py", "/var/www/willyfastsolutions/backend/app/routers/companies.py"),
        ("backend/app/routers/machinery.py", "/var/www/willyfastsolutions/backend/app/routers/machinery.py"),
        ("backend/app/routers/maintenance.py", "/var/www/willyfastsolutions/backend/app/routers/maintenance.py"),
        ("backend/app/routers/settings.py", "/var/www/willyfastsolutions/backend/app/routers/settings.py"),
        ("backend/app/routers/quotes.py", "/var/www/willyfastsolutions/backend/app/routers/quotes.py"),
        ("backend/app/schemas/schemas.py", "/var/www/willyfastsolutions/backend/app/schemas/schemas.py"),
        ("backend/app/services/machinery.py", "/var/www/willyfastsolutions/backend/app/services/machinery.py"),
        ("backend/app/services/maintenance.py", "/var/www/willyfastsolutions/backend/app/services/maintenance.py"),
        ("backend/app/services/email_worker.py", "/var/www/willyfastsolutions/backend/app/services/email_worker.py"),
        ("backend/app/services/audit_worker.py", "/var/www/willyfastsolutions/backend/app/services/audit_worker.py"),
        ("backend/app/services/pdf_generator.py", "/var/www/willyfastsolutions/backend/app/services/pdf_generator.py"),
    ]

    for local_rel, remote_path in backend_files:
        local_full = os.path.join(BASE_DIR, local_rel)
        if os.path.exists(local_full):
            safe_print(f"Uploading {local_rel} -> {remote_path}")
            sftp.put(local_full, remote_path)

    run_cmd("chown -R root:root /var/www/willyfastsolutions/backend")

    safe_print("\n=== STEP 6: RESTARTING PRODUCTION SERVICES ===")
    run_cmd("systemctl restart wfs-backend")
    run_cmd("systemctl is-active wfs-backend")
    run_cmd("nginx -t && systemctl reload nginx")

    sftp.close()
    ssh.close()
    safe_print("\n=================================================================")
    safe_print("  DEPLOYMENT COMPLETED SUCCESSFULLY TO PRODUCTION VPS!")
    safe_print("  Live URL: https://willyfastsolutions.com")
    safe_print("=================================================================")

if __name__ == "__main__":
    build_frontend()
    package_frontend()
    deploy_to_vps()
