from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from app.routes.deps import get_db, get_current_user

from app.models.progress import Progress
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.models.certificate import Certificate
from app.models.badge import Badge
from app.utils.notification_helper import create_notification
from app.schemas.progress_schema import (
    ProgressCreate,
    ProgressResponse
)

router = APIRouter(prefix="/progress", tags=["Progress"])


# MARK LESSON COMPLETE / UPDATE WATCH %
@router.post("/{lesson_id}", response_model=ProgressResponse)
def update_progress(
    lesson_id: int,
    data: ProgressCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    module = db.query(Module).filter(
        Module.id == lesson.module_id
    ).first()

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    # only enrolled students
    enrolled = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course.id
    ).first()

    if not enrolled:
        raise HTTPException(status_code=403, detail="Not enrolled")

    progress = db.query(Progress).filter(
        Progress.user_id == user.id,
        Progress.lesson_id == lesson_id
    ).first()

    if progress:
        progress.completed = data.completed
        progress.watch_percentage = data.watch_percentage
    else:
        progress = Progress(
            user_id=user.id,
            lesson_id=lesson_id,
            completed=data.completed,
            watch_percentage=data.watch_percentage
        )

        db.add(progress)

    db.commit()
    db.refresh(progress)

    return progress


# GET COURSE PROGRESS %
@router.get("/course/{course_id}")
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    modules = db.query(Module).filter(
        Module.course_id == course_id
    ).all()

    lesson_ids = []

    for m in modules:
        lessons = db.query(Lesson).filter(
            Lesson.module_id == m.id
        ).all()

        for l in lessons:
            lesson_ids.append(l.id)

    total_lessons = len(lesson_ids)

    if total_lessons == 0:
        return {
            "completed_lessons": 0,
            "total_lessons": 0,
            "completion_percentage": 0
        }

    completed = db.query(Progress).filter(
        Progress.user_id == user.id,
        Progress.lesson_id.in_(lesson_ids),
        Progress.completed == True
    ).count()

    percentage = round((completed / total_lessons) * 100, 2)
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if percentage == 100:

        existing_certificate = db.query(Certificate).filter(
            Certificate.user_id == user.id,
            Certificate.course_id == course_id
        ).first()

        if not existing_certificate:

            certificate = Certificate(
                user_id=user.id,
                course_id=course_id,
                certificate_code=str(uuid.uuid4())
            )

            db.add(certificate)

            badge = Badge(
                user_id=user.id,
                badge_name="Course Completer",
                description=f"Completed course ID {course_id}"
            )

            db.add(badge)

            db.commit()
            create_notification(
                db=db,
                user_id=user.id,
                title="Certificate Earned",
                message=f"You earned certificate for {course.title}"
                )

    progress_records = db.query(Progress).filter(
        Progress.user_id == user.id
    ).all()

    lesson_progress = {}

    for p in progress_records:
        lesson_progress[p.lesson_id] = {
            "completed": p.completed,
            "watch_percentage": p.watch_percentage
        }

    return {
        "completed_lessons": completed,
        "total_lessons": total_lessons,
        "completion_percentage": percentage,
        "lesson_progress": lesson_progress
    }


@router.get("/resume/{course_id}")
def resume_learning(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    modules = db.query(Module).filter(
        Module.course_id == course_id
    ).order_by(Module.order).all()

    for m in modules:
        lessons = db.query(Lesson).filter(
            Lesson.module_id == m.id
        ).order_by(Lesson.order).all()

        for lesson in lessons:
            progress = db.query(Progress).filter(
                Progress.user_id == user.id,
                Progress.lesson_id == lesson.id
            ).first()

            if not progress or not progress.completed:
                return {
                    "lesson_id": lesson.id,
                    "lesson_title": lesson.title,
                    "module_id": m.id,
                    "module_title": m.title
                }

    return {
        "message": "Course completed"
    }