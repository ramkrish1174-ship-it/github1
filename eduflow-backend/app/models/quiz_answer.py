from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.base import Base


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)

    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"))

    question_id = Column(Integer, ForeignKey("questions.id"))

    selected_answer = Column(String(1))

    is_correct = Column(Boolean, default=False)