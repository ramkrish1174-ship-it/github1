from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from app.db.base import Base


class ForumVote(Base):
    __tablename__ = "forum_votes"

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(
        Integer,
        ForeignKey("forum_posts.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )