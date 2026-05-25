from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    quiz_id = Column(Integer, ForeignKey("quizzes.id"))

    score = Column(Integer, default=0)

    percentage = Column(Float, default=0)

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )