from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(Integer, ForeignKey("quizzes.id"))

    question = Column(String(255), nullable=False)

    option_a = Column(String(255))
    option_b = Column(String(255))
    option_c = Column(String(255))
    option_d = Column(String(255))

    correct_answer = Column(String(1))