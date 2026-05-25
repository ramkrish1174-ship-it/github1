from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime,ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)

    code = Column(String(50), unique=True, nullable=False)

    discount_type = Column(String(20))
   

    discount_value = Column(Float)

    max_usage = Column(Integer, default=1)

    used_count = Column(Integer, default=0)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=True
    )

    is_active = Column(Boolean, default=True)

    expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())