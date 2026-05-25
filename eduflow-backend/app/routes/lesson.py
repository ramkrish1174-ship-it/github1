from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.deps import get_db, get_current_user
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.course import Course
from app.schemas.lesson_schema import LessonCreate, LessonResponse
from app.models.user import User
from app.models.enrollment import Enrollment
router = APIRouter(prefix="/lessons", tags=["Lessons"])


#  CREATE LESSON (Instructor + owner only)
@router.post("/{module_id}", response_model=LessonResponse)
def create_lesson(
    module_id: int,
    data: LessonCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    course = db.query(Course).filter(Course.id == module.course_id).first()

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    lesson = Lesson(**data.dict(), module_id=module_id)

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson


#  GET LESSONS (Public read)
@router.get("/{module_id}", response_model=list[LessonResponse])
def get_lessons(
    module_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    course = db.query(Course).filter(Course.id == module.course_id).first()

    #  access control
    if user.role != "instructor":
        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course.id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="Not enrolled")

    return db.query(Lesson).filter(
        Lesson.module_id == module_id
    ).order_by(Lesson.id).all()


#  DELETE LESSON (Instructor + owner only)
@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == module.course_id).first()

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(lesson)
    db.commit()

    return {"message": "Lesson deleted"}