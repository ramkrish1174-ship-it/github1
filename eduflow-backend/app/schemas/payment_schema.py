from pydantic import BaseModel
from datetime import datetime


class CreatePayment(BaseModel):
    course_id: int
    amount: float


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class PaymentHistoryResponse(BaseModel):
    id: int
    course_id: int
    amount: float
    currency: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True