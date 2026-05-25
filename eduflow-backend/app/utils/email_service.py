from dotenv import load_dotenv
load_dotenv()

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from sqlalchemy.orm import Session
from app.models.email_log import EmailLog

import os


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    SUPPRESS_SEND=True
)


async def send_email(
    db: Session,
    recipient: str,
    subject: str,
    body: str
):

    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)

    await fm.send_message(message)

    log = EmailLog(
        recipient=recipient,
        subject=subject,
        status="sent"
    )

    db.add(log)

    db.commit()