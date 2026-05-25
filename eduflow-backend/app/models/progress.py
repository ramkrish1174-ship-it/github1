from sqlalchemy import Column, Integer, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))

    completed = Column(Boolean, default=False)

    watch_percentage = Column(Float, default=0)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())