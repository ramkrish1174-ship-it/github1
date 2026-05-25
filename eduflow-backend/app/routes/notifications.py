from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from sqlalchemy import desc

from app.routes.deps import get_db, get_current_user

from app.models.notification import Notification

from app.models.user import User

from app.schemas.notification_schema import (
    NotificationResponse
)
from fastapi_cache.decorator import cache
from app.core.limiter import limiter
from fastapi import Request
router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)




@router.get(
    "/",
    response_model=list[NotificationResponse]
)
def my_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    return db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(
        desc(Notification.created_at)
    ).all()


@router.get("/unread-count")
@cache(expire=30)
@limiter.limit("30/minute")
def unread_count(
    request:Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    count = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).count()

    return {
        "unread_count": count
    }




@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()

    return {
        "message": "Notification marked as read"
    }




@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    notifications = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).all()

    for n in notifications:
        n.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read"
    }