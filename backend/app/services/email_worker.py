import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from app.core.config import settings

def send_alert_email(to_email: str, subject: str, body_text: str, attachment_path: str = None):
    if settings.MOCK_SMTP:
        # Mock email printing to console
        print("\n" + "="*80)
        print(" [MOCK EMAIL DISPATCHED]")
        print(f" From:    {settings.SMTP_FROM}")
        print(f" To:      {to_email}")
        print(f" Subject: {subject}")
        print(f" Body:\n{body_text}")
        if attachment_path and os.path.exists(attachment_path):
            print(f" Attachment: {attachment_path} (File size: {os.path.getsize(attachment_path)} bytes)")
        print("="*80 + "\n")
        return True
        
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body_text, 'html'))
        
        if attachment_path and os.path.exists(attachment_path):
            filename = os.path.basename(attachment_path)
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f"attachment; filename= {filename}",
            )
            msg.attach(part)
            
        # Connect to SMTP server using SSL on 465, or standard STARTTLS on other ports
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            server.ehlo()
            server.starttls()
            server.ehlo()
            
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        # Fallback: Print mock if SMTP connection fails so development isn't blocked
        print("Fallback mock email printed below due to SMTP error:")
        print(f" To:      {to_email}")
        print(f" Subject: {subject}")
        return False

def send_password_reset_email(to_email: str, token: str) -> bool:
    reset_url = f"https://willyfastsolutions.com/login/reset?token={token}"
    
    subject = "Password Reset Request - WillyFastSolutions"
    
    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: sans-serif; background-color: #0c0a09; color: #d4d4d8; padding: 20px; margin: 0; }}
    .card {{ background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 30px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }}
    .logo {{ font-size: 20px; font-weight: bold; color: #f4f4f5; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #27272a; padding-bottom: 12px; }}
    .title {{ font-size: 18px; font-weight: bold; color: #f4f4f5; margin-bottom: 16px; }}
    .paragraph {{ font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 12px; }}
    .btn-container {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; background-color: #f4f4f5; color: #09090b; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; transition: background-color 0.2s; }}
    .link-text {{ font-size: 12px; color: #71717a; word-break: break-all; line-height: 1.5; }}
    .footer {{ font-size: 11px; color: #71717a; margin-top: 30px; border-top: 1px solid #27272a; padding-top: 15px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WillyFastSolutions</div>
    <div class="title">Password Reset Request</div>
    <p class="paragraph">
      We received a request to reset your password. Click the button below to set a new password. This secure link is valid for 15 minutes.
    </p>
    <div class="btn-container">
      <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p class="link-text">
      If you cannot click the button, copy and paste this URL into your browser:<br>
      <span style="color: #a1a1aa;">{reset_url}</span>
    </p>
    <div class="footer">
      This is an automated security message from WillyFastSolutions. If you did not request this change, you can safely ignore this email.
    </div>
  </div>
</body>
</html>
"""
    # Use send_alert_email to dispatch HTML body
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html)


def send_welcome_email(to_email: str, full_name: str, temp_password: str, company_name: str) -> bool:
    subject = f"Welcome to WillyFastSolutions - {company_name}"
    
    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: sans-serif; background-color: #0c0a09; color: #d4d4d8; padding: 20px; margin: 0; }}
    .card {{ background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 30px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
    .logo {{ font-size: 20px; font-weight: bold; color: #f4f4f5; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #27272a; padding-bottom: 12px; }}
    .title {{ font-size: 18px; font-weight: bold; color: #f4f4f5; margin-bottom: 16px; }}
    .paragraph {{ font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 12px; }}
    .credentials {{ background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; }}
    .cred-label {{ font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }}
    .cred-value {{ font-size: 16px; color: #f4f4f5; font-weight: bold; margin-bottom: 12px; }}
    .warning {{ background-color: #451a03; border: 1px solid #92400e; border-radius: 8px; padding: 12px; margin: 16px 0; }}
    .warning-text {{ font-size: 13px; color: #fbbf24; }}
    .btn-container {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; background-color: #f4f4f5; color: #09090b; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; }}
    .footer {{ font-size: 11px; color: #71717a; margin-top: 30px; border-top: 1px solid #27272a; padding-top: 15px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WillyFastSolutions</div>
    <div class="title">Welcome, {full_name}!</div>
    <p class="paragraph">
      Your administrator has created an account for you on the WillyFastSolutions fleet management portal under <strong>{company_name}</strong>. Below are your temporary login credentials.
    </p>
    <div class="credentials">
      <div class="cred-label">Email</div>
      <div class="cred-value">{to_email}</div>
      <div class="cred-label">Temporary Password</div>
      <div class="cred-value">{temp_password}</div>
    </div>
    <div class="warning">
      <p class="warning-text">
        &#9888;&#65039; You will be required to change this temporary password upon your first sign in.
      </p>
    </div>
    <div class="btn-container">
      <a href="https://willyfastsolutions.com/login" class="btn" target="_blank">Sign In to Dashboard</a>
    </div>
    <div class="footer">
      This is an automated message from WillyFastSolutions. Do not share your credentials with anyone.
    </div>
  </div>
</body>
</html>
"""
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html)


def send_report_email(to_email: str, machine_name: str, company_name: str, attachment_path: str) -> bool:
    subject = f"Machinery Report: {machine_name} - {company_name}"
    
    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: sans-serif; background-color: #0c0a09; color: #d4d4d8; padding: 20px; margin: 0; }}
    .card {{ background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 30px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
    .logo {{ font-size: 20px; font-weight: bold; color: #f4f4f5; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #27272a; padding-bottom: 12px; }}
    .title {{ font-size: 18px; font-weight: bold; color: #f4f4f5; margin-bottom: 16px; }}
    .paragraph {{ font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 12px; }}
    .info-box {{ background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px; margin: 16px 0; }}
    .info-label {{ font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }}
    .info-value {{ font-size: 15px; color: #f4f4f5; font-weight: bold; margin-bottom: 8px; }}
    .footer {{ font-size: 11px; color: #71717a; margin-top: 30px; border-top: 1px solid #27272a; padding-top: 15px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WillyFastSolutions</div>
    <div class="title">Machinery Maintenance Report</div>
    <p class="paragraph">
      Please find attached the official maintenance report for the equipment listed below. This report was generated by the WillyFastSolutions fleet management platform.
    </p>
    <div class="info-box">
      <div class="info-label">Equipment</div>
      <div class="info-value">{machine_name}</div>
      <div class="info-label">Company</div>
      <div class="info-value">{company_name}</div>
    </div>
    <div class="footer">
      This is an automated report from WillyFastSolutions.
    </div>
  </div>
</body>
</html>
"""
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html, attachment_path=attachment_path)

def send_quote_request_email(full_name: str, email: str, company_name: str, message: str) -> bool:
    from datetime import datetime
    subject = f"New Quote Request - {company_name}"
    
    # Clean message to avoid HTML injection
    safe_message = message.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    
    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: sans-serif; background-color: #09090b; color: #e4e4e7; padding: 20px; margin: 0; }}
    .card {{ background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; max-width: 600px; margin: 20px auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); }}
    .badge {{ display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; font-size: 10px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }}
    .logo {{ font-size: 14px; font-weight: bold; color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #27272a; padding-bottom: 12px; }}
    .title {{ font-size: 20px; font-weight: bold; color: #f4f4f5; margin-bottom: 8px; }}
    .subtitle {{ font-size: 12px; color: #a1a1aa; margin-bottom: 24px; }}
    .info-grid {{ border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; padding: 16px 0; margin-bottom: 24px; }}
    .info-row {{ display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }}
    .info-label {{ color: #71717a; font-weight: 500; }}
    .info-value {{ color: #f4f4f5; font-weight: 600; text-align: right; }}
    .message-box {{ background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; font-size: 13px; color: #d4d4d8; line-height: 1.6; font-style: italic; margin-bottom: 28px; }}
    .btn-container {{ display: flex; gap: 12px; margin-top: 24px; }}
    .btn {{ flex: 1; text-align: center; display: inline-block; padding: 12px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 12px; transition: all 0.2s; }}
    .btn-primary {{ background-color: #f4f4f5; color: #09090b; border: 1px solid #f4f4f5; }}
    .btn-secondary {{ background-color: transparent; color: #a1a1aa; border: 1px solid #27272a; }}
    .footer {{ font-size: 11px; color: #52525b; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 15px; text-align: center; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WillyFastSolutions</div>
    <div class="badge">New Lead / Nuevo Prospecto</div>
    <div class="title">Service Quotation Request</div>
    <div class="subtitle">A customer has submitted a new inquiry through the landing page.</div>
    
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Full Name</span>
        <span class="info-value">{full_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email Address</span>
        <span class="info-value"><a href="mailto:{email}" style="color: #10b981; text-decoration: none;">{email}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">Company Name</span>
        <span class="info-value">{company_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Submission Date</span>
        <span class="info-value">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</span>
      </div>
    </div>
    
    <div style="font-size: 11px; color: #71717a; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.05em;">Message / Fleet Details:</div>
    <div class="message-box">
      "{safe_message}"
    </div>
    
    <div class="btn-container">
      <a href="mailto:{email}?subject=WillyFastSolutions Quotation Request - {company_name}" class="btn btn-primary">Reply to Lead</a>
      <a href="https://willyfastsolutions.com/dashboard" class="btn btn-secondary">Open Admin Dashboard</a>
    </div>
    
    <div class="footer">
      This is an automated notification from the WillyFastSolutions platform.<br>
      Please contact support if you notice any unusual activity.
    </div>
  </div>
</body>
</html>
"""
    return send_alert_email(to_email="admin@willyfastsolutions.com", subject=subject, body_text=body_html)

