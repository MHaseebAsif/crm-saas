import aiosmtplib
from email.message import EmailMessage
from configs.settings import SETTINGS

async def send_mail(to: str, subj: str, body: str):
    m = EmailMessage()
    m["From"] = SETTINGS.smtp_user
    m["To"] = to
    m["Subject"] = subj
    m.set_content(body)
    await aiosmtplib.send(
        m,
        hostname=SETTINGS.smtp_host,
        port=SETTINGS.smtp_port,
        username=SETTINGS.smtp_user,
        password=SETTINGS.smtp_pass,
        use_tls=True,
    )

async def send_reset_email(to: str, token: str):
    subj = "Password Reset"
    body = f"Use this token to reset your password:\n\n{token}\n\nThis token expires in 1 hour."
    await send_mail(to, subj, body)
