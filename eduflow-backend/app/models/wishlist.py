from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )