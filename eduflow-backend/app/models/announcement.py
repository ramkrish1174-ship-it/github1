from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    instructor_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    title = Column(String(255))

    message = Column(String(1000))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )