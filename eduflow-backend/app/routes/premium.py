from datetime import datetime

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user
from app.models.subscription import Subscription
from app.models.user import User


def require_premium(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=403,
            detail="Premium subscription required"
        )

    if subscription.end_date < datetime.utcnow():
        subscription.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=403,
            detail="Subscription expired"
        )

    return current_user