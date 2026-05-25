from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.deps import get_db, get_current_user
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.user import User
from app.schemas.enrollment_schema import EnrollmentResponse
from app.utils.notification_helper import create_notification
router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


#  Enroll in Course
@router.post("/{course_id}", response_model=EnrollmentResponse)
def enroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # prevent instructor enrolling own course
    if course.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot enroll your own course")
     
    # check alrdy entrolled by student
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    create_notification(
        db=db,
        user_id=course.owner_id,
        title="New Enrollment",
        message=f"{current_user.name} enrolled in {course.title}"
    )

    return enrollment



#  Get My Courses
@router.get("/")
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()

    result = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()

        result.append({
            "id": e.id,
            "course_id": course.id,
            "title": course.title,
            "description": course.description,
            "category": course.category,
            "price": course.price,
            "enrolled_at": e.enrolled_at
        })

    return result


#  Instructor → see students
@router.get("/course/{course_id}")
def get_enrolled_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    return enrollments


#  Unenroll)
@router.delete("/{course_id}")
def unenroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")

    db.delete(enrollment)
    db.commit()

    return {"message": "Unenrolled successfully"}