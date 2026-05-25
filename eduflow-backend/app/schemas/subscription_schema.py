from pydantic import BaseModel
from datetime import datetime


class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    duration_months: int
    price: float
    description: str | None = None

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: str
    start_date: datetime
    end_date: datetime

    class Config:
        from_attributes = True

class RazorpaySubscriptionVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str