from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import asyncio

from app.routes.deps import get_db, get_current_user

from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.announcement import Announcement

from app.utils.email_service import send_email


router = APIRouter(
    prefix="/emails",
    tags=["Emails"]
)


@router.post("/announcement/{course_id}")
def send_announcement(
    course_id: int,
    title: str,
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "instructor":
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

    if course.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    announcement = Announcement(
        course_id=course_id,
        instructor_id=current_user.id,
        title=title,
        message=message
    )

    db.add(announcement)

    db.commit()

    for enrollment in enrollments:

        student = db.query(User).filter(
            User.id == enrollment.user_id
        ).first()

        if not student.email_notifications:
            continue

        asyncio.run(
            send_email(
                db=db,
                recipient=student.email,
                subject=title,
                body=f"""
                <h2>{title}</h2>
                <p>{message}</p>
                <br>
                <p>Course: {course.title}</p>
                """
            )
        )

    return {
        "message": "Announcement emails sent"
    }