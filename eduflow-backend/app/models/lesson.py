from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False)
    content = Column(String(50))
    type = Column(String(50))  
    order = Column(Integer, default=0)

    module_id = Column(Integer, ForeignKey("modules.id"))

    module = relationship("Module", back_populates="lessons")