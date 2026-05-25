from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id = Column(Integer, primary_key=True, index=True)

    coupon_id = Column(Integer, ForeignKey("coupons.id"))

    user_id = Column(Integer, ForeignKey("users.id"))

    used_at = Column(DateTime(timezone=True),
                     server_default=func.now())