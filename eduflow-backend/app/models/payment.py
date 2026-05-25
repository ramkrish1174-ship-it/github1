from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"),index=True)
    course_id = Column(Integer, ForeignKey("courses.id"),index=True)

    razorpay_order_id = Column(String(255), unique=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(500), nullable=True)
    coupon_id = Column(Integer,ForeignKey("coupons.id"),nullable=True)

    amount = Column(Float)

    currency = Column(String(20), default="inr")

    payment_status = Column(String(50), default="pending",index=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )