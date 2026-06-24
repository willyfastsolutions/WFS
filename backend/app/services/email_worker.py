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


def send_welcome_email(to_email: str, full_name: str, temp_password: str, company_name: str) -> bool:
    subject = f"Welcome to WillyFastSolutions / Bienvenido a WillyFastSolutions - {company_name}"
    
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
    <div class="title">Welcome, {full_name}! / \u00a1Bienvenido, {full_name}!</div>
    <p class="paragraph">
      <strong>English:</strong> Your administrator has created an account for you on WillyFastSolutions under the company <strong>{company_name}</strong>. Below are your temporary login credentials.
    </p>
    <p class="paragraph">
      <strong>Espa\u00f1ol:</strong> Tu administrador ha creado una cuenta para ti en WillyFastSolutions bajo la empresa <strong>{company_name}</strong>. A continuaci\u00f3n encontrar\u00e1s tus credenciales temporales de acceso.
    </p>
    <div class="credentials">
      <div class="cred-label">Email</div>
      <div class="cred-value">{to_email}</div>
      <div class="cred-label">Temporary Password / Contrase\u00f1a Temporal</div>
      <div class="cred-value">{temp_password}</div>
    </div>
    <div class="warning">
      <p class="warning-text">
        \u26a0\ufe0f You will be required to change this password on your first login.<br>
        \u26a0\ufe0f Se te pedir\u00e1 cambiar esta contrase\u00f1a en tu primer inicio de sesi\u00f3n.
      </p>
    </div>
    <div class="btn-container">
      <a href="https://willyfastsolutions.com/login" class="btn" target="_blank">Sign In / Iniciar Sesi\u00f3n</a>
    </div>
    <div class="footer">
      This is an automated message from WillyFastSolutions. Do not share your credentials with anyone.<br>
      Este es un mensaje autom\u00e1tico de WillyFastSolutions. No compartas tus credenciales con nadie.
    </div>
  </div>
</body>
</html>
"""
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html)


def send_report_email(to_email: str, machine_name: str, company_name: str, attachment_path: str) -> bool:
    subject = f"Machinery Report: {machine_name} / Reporte de Maquinaria: {machine_name} - {company_name}"
    
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
    <div class="title">Machinery Report / Reporte de Maquinaria</div>
    <p class="paragraph">
      <strong>English:</strong> Please find attached the maintenance report for the machine listed below. This report was generated and sent by the WillyFastSolutions fleet management platform.
    </p>
    <p class="paragraph">
      <strong>Espa\u00f1ol:</strong> Adjunto encontrar\u00e1s el reporte de mantenimiento para la m\u00e1quina que se indica abajo. Este reporte fue generado y enviado desde la plataforma de gesti\u00f3n de flotas WillyFastSolutions.
    </p>
    <div class="info-box">
      <div class="info-label">Machine / M\u00e1quina</div>
      <div class="info-value">{machine_name}</div>
      <div class="info-label">Company / Empresa</div>
      <div class="info-value">{company_name}</div>
    </div>
    <div class="footer">
      This is an automated message from WillyFastSolutions.<br>
      Este es un mensaje autom\u00e1tico de WillyFastSolutions.
    </div>
  </div>
</body>
</html>
"""
    return send_alert_email(to_email=to_email, subject=subject, body_text=body_html, attachment_path=attachment_path)
