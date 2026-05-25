# import stripe
import os
import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import Optional
from app.routes.deps import get_db, get_current_user

from app.models.user import User
from app.models.subscription import Subscription
from app.models.subscription_plan import SubscriptionPlan
from app.models.coupon import Coupon
from app.models.coupon_usage import CouponUsage
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.subscription_schema import (
    SubscriptionPlanResponse,
    SubscriptionResponse
)
from app.schemas.subscription_schema import RazorpaySubscriptionVerify
from fastapi_cache.decorator import cache
from app.core.limiter import limiter
from fastapi import Request
# stripe.api_key= os.getenv("STRIPE_SECRET_KEY")
razorpay_client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET"),
    )
)
router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


# GET ALL PLANS
@router.get("/plans",
response_model=list[SubscriptionPlanResponse])
def get_plans(
    db: Session = Depends(get_db)
):

    return db.query(SubscriptionPlan).filter(
        SubscriptionPlan.is_active == True
    ).all()


# CREATE SUBSCRIPTION CHECKOUT
@router.post("/create-order/{plan_id}")
@limiter.limit("5/minute")
def create_subscription_order(
    request: Request,
    plan_id: int,
    coupon_code: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )

    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already subscribed"
        )

    final_price = plan.price

    if coupon_code:

        coupon = db.query(Coupon).filter(
            Coupon.code == coupon_code,
            Coupon.is_active == True
        ).first()

        if coupon:

            if coupon.discount_type == "percentage":
                final_price -= (
                    final_price * coupon.discount_value / 100
                )

            elif coupon.discount_type == "fixed":
                final_price -= coupon.discount_value

    final_price = max(final_price, 0)

    order_data = {
        "amount": int(final_price * 100),
        "currency": "INR",
        "payment_capture": 1
    }

    order = razorpay_client.order.create(
        data=order_data
    )

    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        razorpay_order_id=order["id"],
        status="pending"
    )

    db.add(subscription)

    db.commit()

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "razorpay_key": os.getenv("RAZORPAY_KEY_ID")
    }

# VERIFY SUBSCRIPTION PAYMENT
@router.post("/verify")
def verify_subscription(
    data: RazorpaySubscriptionVerify,
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

        subscription = db.query(Subscription).filter(
            Subscription.razorpay_order_id
            == data.razorpay_order_id
        ).first()

        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found"
            )

        if subscription.status == "active":
            return {
                "message": "Already verified"
            }

        subscription.status = "active"

        subscription.razorpay_payment_id = (
            data.razorpay_payment_id
        )

        subscription.razorpay_signature = (
            data.razorpay_signature
        )

        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == subscription.plan_id
        ).first()

        subscription.end_date = (
            datetime.utcnow() +
            relativedelta(months=plan.duration_months)
        )

        premium_courses = db.query(Course).filter(
            Course.is_premium == True,
            Course.status == "published"
        ).all()

        for course in premium_courses:

            existing = db.query(Enrollment).filter(
                Enrollment.user_id == subscription.user_id,
                Enrollment.course_id == course.id,
                Enrollment.access_type == "subscription"
            ).first()

            if not existing:

                enrollment = Enrollment(
                    user_id=subscription.user_id,
                    course_id=course.id,
                    access_type="subscription"
                )

                db.add(enrollment)

        db.commit()

        return {
            "message": "Subscription activated"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# MY SUBSCRIPTION
@router.get("/me",
response_model=Optional[SubscriptionResponse])
def my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if not subscription:
        return None

    return subscription


# CANCEL SUBSCRIPTION
@router.delete("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No active subscription"
        )

    subscription.status = "cancelled"

    db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.access_type == "subscription"
    ).delete()

    db.commit()

    return {
        "message": "Subscription cancelled"
    }

# SUBSCRIPTION HISTORY
@router.get("/history")
def subscription_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(
        Subscription.created_at.desc()
    ).all()

    result = []

    for sub in subscriptions:

        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == sub.plan_id
        ).first()

        result.append({
            "id": sub.id,
            "type": "subscription",
            "plan_name": plan.name,
            "amount": plan.price,
            "status": sub.status,
            "created_at": sub.created_at
        })

    return result