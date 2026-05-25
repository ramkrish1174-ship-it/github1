from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.sql import func

from app.db.base import Base


class LiveClass(Base):
    __tablename__ = "live_classes"

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

    description = Column(Text)

    meeting_link = Column(String(500))

    recording_link = Column(
        String(500),
        nullable=True
    )

    start_time = Column(DateTime)

    end_time = Column(DateTime)

    status = Column(
        String(50),
        default="scheduled"
    )
    # scheduled | live | completed | cancelled

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )