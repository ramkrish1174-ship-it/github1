from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db.base import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(50), nullable=False)

    duration_months = Column(Integer, nullable=False)

    price = Column(Float, nullable=False)

    description = Column(String(255))

    is_active = Column(Boolean, default=True)