from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from datetime import datetime

from app.routes.deps import get_db, get_current_user
from app.utils.notification_helper import create_notification
from app.models.live_class import LiveClass
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User

from app.schemas.live_class_schema import (
    LiveClassCreate,
    LiveClassUpdate,
    LiveClassResponse
)

router = APIRouter(
    prefix="/live-classes",
    tags=["Live Classes"]
)




@router.post(
    "/{course_id}",
    response_model=LiveClassResponse
)
def create_live_class(
    course_id: int,
    data: LiveClassCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    if user.role != "instructor":
        raise HTTPException(
            status_code=403,
            detail="Only instructors"
        )

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if course.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    if data.end_time <= data.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    live_class = LiveClass(
        course_id=course_id,
        instructor_id=user.id,
        title=data.title,
        description=data.description,
        meeting_link=data.meeting_link,
        start_time=data.start_time,
        end_time=data.end_time,
        status="scheduled"
    )

    db.add(live_class)

    db.commit()

    db.refresh(live_class)
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    for enrollment in enrollments:
        create_notification(
            db=db,
            user_id=enrollment.user_id,
            title="New Live Class",
            message=f"{course.title}: {data.title} scheduled"
        )

    return live_class




@router.put(
    "/{live_class_id}",
    response_model=LiveClassResponse
)
def update_live_class(
    live_class_id: int,
    data: LiveClassUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    live_class = db.query(LiveClass).filter(
        LiveClass.id == live_class_id
    ).first()

    if not live_class:
        raise HTTPException(
            status_code=404,
            detail="Live class not found"
        )

    if live_class.instructor_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    for key, value in data.dict(
        exclude_unset=True
    ).items():
        setattr(live_class, key, value)

    db.commit()

    db.refresh(live_class)

    return live_class




@router.put("/cancel/{live_class_id}")
def cancel_live_class(
    live_class_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    live_class = db.query(LiveClass).filter(
        LiveClass.id == live_class_id
    ).first()

    if not live_class:
        raise HTTPException(
            status_code=404,
            detail="Live class not found"
        )

    if live_class.instructor_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    live_class.status = "cancelled"

    db.commit()

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == live_class.course_id
    ).all()

    course = db.query(Course).filter(
        Course.id == live_class.course_id
    ).first()

    for enrollment in enrollments:
        create_notification(
            db=db,
            user_id=enrollment.user_id,
            title="Live Class Cancelled",
            message=f"{live_class.title} in {course.title} was cancelled"
        )

    return {
        "message": "Live class cancelled"
    }




@router.get(
    "/course/{course_id}",
    response_model=list[LiveClassResponse]
)
def get_course_live_classes(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # students must enroll
    if user.role != "instructor":

        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course_id
        ).first()

        if not enrolled:
            raise HTTPException(
                status_code=403,
                detail="Not enrolled"
            )

    return db.query(LiveClass).filter(
        LiveClass.course_id == course_id
    ).order_by(
        LiveClass.start_time.asc()
    ).all()




@router.get(
    "/upcoming/me",
    response_model=list[LiveClassResponse]
)
def upcoming_live_classes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == user.id
    ).all()

    course_ids = [
        e.course_id
        for e in enrollments
    ]

    return db.query(LiveClass).filter(
        LiveClass.course_id.in_(course_ids),
        LiveClass.start_time >= datetime.utcnow(),
        LiveClass.status != "cancelled"
    ).order_by(
        LiveClass.start_time.asc()
    ).all()




@router.get(
    "/instructor/me",
    response_model=list[LiveClassResponse]
)
def instructor_live_classes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    if user.role != "instructor":
        raise HTTPException(
            status_code=403,
            detail="Only instructors"
        )

    return db.query(LiveClass).filter(
        LiveClass.instructor_id == user.id
    ).order_by(
        LiveClass.start_time.desc()
    ).all()

@router.delete("/{live_class_id}")
def delete_live_class(
    live_class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    live_class = db.query(LiveClass).filter(
        LiveClass.id == live_class_id
    ).first()

    if not live_class:
        raise HTTPException(
            status_code=404,
            detail="Live class not found"
        )

    course = db.query(Course).filter(
        Course.id == live_class.course_id
    ).first()

    if course.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    db.delete(live_class)

    db.commit()

    return {
        "message": "Live class deleted"
    }