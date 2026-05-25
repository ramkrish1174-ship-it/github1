from datetime import datetime

from app.models.enrollment import Enrollment
from app.models.subscription import Subscription


def has_course_access(db, user_id, course):

    # permanent purchase
    purchase_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course.id,
        Enrollment.access_type == "purchase"
    ).first()

    is_enrolled = bool(purchase_enrollment)

    # temporary subscription access
    has_subscription_access = False

    if course.is_premium:

        subscription = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.end_date > datetime.utcnow()
        ).first()

        if subscription:
            has_subscription_access = True

    return {
        "is_enrolled": is_enrolled,
        "has_subscription_access": has_subscription_access
    }