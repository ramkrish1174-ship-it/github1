from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False)
    order = Column(Integer, default=0)

    course_id = Column(Integer, ForeignKey("courses.id"))

    lessons = relationship("Lesson", back_populates="module", cascade="all, delete")