from sqlalchemy import Column, Integer, String, Float, DateTime,ForeignKey,Boolean
from datetime import datetime
from app.db.base import Base
from sqlalchemy.sql import func
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False)
    description = Column(String(255))
    category = Column(String(50), index=True)
    level = Column(String(50), default="beginner")
    price = Column(Float)
    status = Column(String(50), default="draft",index=True)  
    is_featured = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"),index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),index=True)