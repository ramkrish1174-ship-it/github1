from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    lesson_id = Column(Integer, ForeignKey("lessons.id"))