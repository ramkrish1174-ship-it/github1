from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from app.db.base import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"),index=True)

    plan_id = Column(Integer, ForeignKey("subscription_plans.id"))

    razorpay_order_id = Column(String(255), nullable=True)

    razorpay_payment_id = Column(String(255), nullable=True)

    razorpay_signature = Column(String(255), nullable=True)

    status = Column(String(50), default="active",index=True)

    start_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    end_date = Column(DateTime)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )