from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)

    recipient = Column(String(255))

    subject = Column(String(255))

    status = Column(String(50), default="sent")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )