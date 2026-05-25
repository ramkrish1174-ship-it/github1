import stripe
import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from app.routes.deps import get_db, get_current_user
from app.models.course import Course
from app.models.user import User
from app.models.payment import Payment
from app.models.enrollment import Enrollment
from app.utils.email_service import send_email
from app.schemas.payment_schema import (
    CheckoutResponse,
    PaymentHistoryResponse
)
from app.schemas.payment_schema import (
    CreatePayment,
    RazorpayVerify,
    PaymentHistoryResponse
)
from app.models.coupon import Coupon
from datetime import datetime
from app.utils.notification_helper import create_notification
# stripe.api_key= os.getenv("STRIPE_SECRET_KEY")
razorpay_client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET"),
    )
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# CREATE CHECKOUT SESSION
@router.post("/create-order")
def create_order(
    data: CreatePayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == data.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course.id,
        Enrollment.access_type == "purchase"
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already purchased"
        )

    order_data = {
        "amount": int(data.amount * 100),
        "currency": "INR",
        "payment_capture": 1
    }

    order = razorpay_client.order.create(
        data=order_data
    )

    payment = Payment(
        user_id=current_user.id,
        course_id=course.id,
        amount=data.amount,
        currency="inr",
        razorpay_order_id=order["id"],
        payment_status="pending"
    )

    db.add(payment)

    db.commit()

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "razorpay_key": os.getenv("RAZORPAY_KEY_ID")
    }

# VERIFY PAYMENT

@router.post("/verify")
def verify_payment(
    data: RazorpayVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        params_dict = {
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature,
        }

        razorpay_client.utility.verify_payment_signature(
            params_dict
        )

        payment = db.query(Payment).filter(
            Payment.razorpay_order_id
            == data.razorpay_order_id
        ).first()

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment not found"
            )

        if payment.payment_status == "paid":
            return {
                "message": "Already verified"
            }

        payment.payment_status = "paid"

        payment.razorpay_payment_id = (
            data.razorpay_payment_id
        )

        payment.razorpay_signature = (
            data.razorpay_signature
        )

        existing = db.query(Enrollment).filter(
            Enrollment.user_id == payment.user_id,
            Enrollment.course_id == payment.course_id,
            Enrollment.access_type == "purchase"
        ).first()

        if not existing:

            enrollment = Enrollment(
                user_id=payment.user_id,
                course_id=payment.course_id,
                access_type="purchase"
            )

            db.add(enrollment)

        db.commit()

        return {
            "message": "Payment verified successfully"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# PAYMENT HISTORY

@router.get("/history",
response_model=list[PaymentHistoryResponse])
def payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(
        Payment.created_at.desc()
    ).all()

    return payments