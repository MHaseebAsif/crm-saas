from helpers.email_helper import send_mail

async def proc_email(to: str, subj: str, body: str):
    await send_mail(to, subj, body)
