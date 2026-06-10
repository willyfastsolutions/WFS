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
            
        # Connect to SMTP server using standard STARTTLS
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
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
