from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import stripe
import os
from app.routes.deps import get_db, get_current_user

from app.models.user import User
from app.models.course import Course
from app.models.payment import Payment
from app.models.enrollment import Enrollment
from app.models.review import Review
from app.models.subscription import Subscription

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
stripe.routes_key = os.getenv("STRIPE_SECRET_KEY")

# ADMIN CHECK
def verify_admin(user: User):
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )


# ADMIN DASHBOARD
@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    total_users = db.query(User).count()

    total_students = db.query(User).filter(
        User.role == "student"
    ).count()

    total_instructors = db.query(User).filter(
        User.role == "instructor"
    ).count()

    total_courses = db.query(Course).count()

    total_enrollments = db.query(Enrollment).count()

    total_reviews = db.query(Review).count()

    total_subscriptions = db.query(Subscription).count()

    total_revenue = db.query(
        func.sum(Payment.amount)
    ).filter(
        Payment.payment_status == "paid"
    ).scalar() or 0

    recent_payments = db.query(Payment).order_by(
        Payment.created_at.desc()
    ).limit(5).all()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_instructors": total_instructors,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_reviews": total_reviews,
        "total_subscriptions": total_subscriptions,
        "total_revenue": total_revenue,
        "recent_payments": recent_payments
    }


# ALL USERS
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    return db.query(User).order_by(
        User.created_at.desc()
    ).all()


# DELETE USER
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted"
    }


# ALL COURSES
@router.get("/courses")
def admin_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    return db.query(Course).order_by(
        Course.created_at.desc()
    ).all()


# DELETE COURSE
@router.delete("/courses/{course_id}")
def admin_delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.delete(course)

    db.commit()

    return {
        "message": "Course deleted"
    }


# FEATURE COURSE
@router.put("/courses/{course_id}/feature")
def feature_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    course.is_featured = True

    db.commit()

    return {
        "message": "Course featured"
    }


# PAYMENTS
@router.get("/payments")
def all_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    return db.query(Payment).order_by(
        Payment.created_at.desc()
    ).all()


# PLATFORM ANALYTICS
@router.get("/analytics")
def platform_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    top_courses = db.query(
        Course.title,
        func.count(Enrollment.id).label("students")
    ).join(
        Enrollment,
        Enrollment.course_id == Course.id
    ).group_by(
        Course.id
    ).order_by(
        func.count(Enrollment.id).desc()
    ).limit(5).all()

    top_instructors = db.query(
        User.name,
        func.count(Course.id).label("courses")
    ).join(
        Course,
        Course.owner_id == User.id
    ).filter(
        User.role == "instructor"
    ).group_by(
        User.id
    ).order_by(
        func.count(Course.id).desc()
    ).limit(5).all()

    return {
        "top_courses": top_courses,
        "top_instructors": top_instructors
    }

@router.post("/payments/{payment_id}/refund")
def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="Only paid transactions can be refunded"
        )

    if not payment.payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="No payment intent found"
        )

    stripe.Refund.create(
        payment_intent=payment.payment_intent_id
    )

    payment.payment_status = "refunded"

    db.commit()

    return {
        "message": "Payment refunded successfully"
    }

@router.post("/payments/{payment_id}/refund")
def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="Only paid transactions can be refunded"
        )

    if not payment.payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="No payment intent found"
        )

    stripe.Refund.create(
        payment_intent=payment.payment_intent_id
    )

    payment.payment_status = "refunded"

    db.commit()

    return {
        "message": "Payment refunded successfully"
    }

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    verify_admin(current_user)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_active = not user.is_active

    db.commit()

    return {
        "message": "User status updated"
    }