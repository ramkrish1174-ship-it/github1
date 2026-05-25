from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func

from app.db.base import Base


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    title = Column(String(255))

    content = Column(Text)

    is_resolved = Column(
        Boolean,
        default=False
    )

    upvotes = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )