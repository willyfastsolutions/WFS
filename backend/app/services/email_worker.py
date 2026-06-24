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
    
    subject = "Password Reset Request / Recuperación de Contraseña - WillyFastSolutions"
    
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
    <div class="title">Password Recovery / Recuperación de Contraseña</div>
    <p class="paragraph">
      <strong>English:</strong> We received a request to reset your password. Click the button below to set a new password. This link is valid for 15 minutes.
    </p>
    <p class="paragraph">
      <strong>Español:</strong> Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para establecer una nueva contraseña. Este enlace es válido por 15 minutos.
    </p>
    <div class="btn-container">
      <a href="{reset_url}" class="btn" target="_blank">Reset Password / Restablecer Contraseña</a>
    </div>
    <p class="link-text">
      If you cannot click the button, copy and paste this URL into your browser:<br>
      Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:<br>
      <span style="color: #a1a1aa;">{reset_url}</span>
    </p>
    <div class="footer">
      This is an automated security message. If you did not request this change, you can safely ignore this email.<br>
      Este es un mensaje de seguridad automático. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
    </div>
  </div>
</body>
</html>
"""
    # Use send_alert_email to dispatch HTML body
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html)
