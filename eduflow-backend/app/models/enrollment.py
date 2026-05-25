from sqlalchemy import Column, Integer, ForeignKey, DateTime,String
from datetime import datetime
from app.db.base import Base
from sqlalchemy.sql import func
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),index=True)
    course_id = Column(Integer, ForeignKey("courses.id"),index=True)
    access_type = Column(String(20), default="purchase")
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())