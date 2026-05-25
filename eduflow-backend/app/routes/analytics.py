from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.routes.deps import get_db, get_current_user

from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.review import Review
from app.models.quiz_attempt import QuizAttempt
from app.models.progress import Progress
from app.models.quiz import Quiz
from fastapi_cache.decorator import cache
from app.core.limiter import limiter
from fastapi import Request
router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)



@router.get("/instructor")
@cache(expire=600)
@limiter.limit("10/minute")
def instructor_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    courses = db.query(Course).filter(
        Course.owner_id == current_user.id
    ).all()

    course_ids = [c.id for c in courses]

    total_courses = len(courses)

    total_students = db.query(Enrollment).filter(
        Enrollment.course_id.in_(course_ids)
    ).count()

    total_revenue = db.query(
        func.sum(Payment.amount)
    ).filter(
        Payment.course_id.in_(course_ids),
        Payment.payment_status == "paid"
    ).scalar() or 0

    avg_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.course_id.in_(course_ids)
    ).scalar() or 0

    recent_courses = []

    for course in courses[:5]:

        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id == course.id
        ).count()

        revenue = db.query(
            func.sum(Payment.amount)
        ).filter(
            Payment.course_id == course.id,
            Payment.payment_status == "paid"
        ).scalar() or 0

        rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.course_id == course.id
        ).scalar() or 0

        recent_courses.append({
            "id": course.id,
            "title": course.title,
            "students": enrollments,
            "revenue": revenue,
            "rating": round(rating, 1)
        })

    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "total_revenue": total_revenue,
        "average_rating": round(avg_rating, 1),
        "courses": recent_courses
    }



@router.get("/student")
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()

    enrolled_course_ids = [
        e.course_id for e in enrollments
    ]

    total_courses = len(enrollments)

    completed_lessons = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.completed == True
    ).count()

    quiz_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).all()

    avg_score = 0

    if len(quiz_attempts) > 0:
        avg_score = sum(
            q.percentage for q in quiz_attempts
        ) / len(quiz_attempts)

    learning_courses = []

    for course_id in enrolled_course_ids:

        course = db.query(Course).filter(
            Course.id == course_id
        ).first()

        progress = db.query(Progress).filter(
            Progress.user_id == current_user.id
        ).count()

        learning_courses.append({
            "id": course.id,
            "title": course.title,
            "progress": progress
        })

    return {
        "total_courses": total_courses,
        "completed_lessons": completed_lessons,
        "average_quiz_score": round(avg_score, 1),
        "quiz_attempts": len(quiz_attempts),
        "courses": learning_courses
    }




@router.get("/revenue-chart")
@cache(expire=600)
@limiter.limit("10/minute")
def revenue_chart(
    request:Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    courses = db.query(Course).filter(
        Course.owner_id == current_user.id
    ).all()

    data = []

    for course in courses:

        revenue = db.query(
            func.sum(Payment.amount)
        ).filter(
            Payment.course_id == course.id,
            Payment.payment_status == "paid"
        ).scalar() or 0

        data.append({
            "course": course.title,
            "revenue": revenue
        })

    return data




@router.get("/quiz-performance")
@cache(expire=120)
@limiter.limit("20/minute")
def quiz_performance(
    request:Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).all()

    result = []

    for attempt in attempts:

        quiz = db.query(Quiz).filter(
            Quiz.id == attempt.quiz_id
        ).first()

        result.append({
            "quiz": quiz.title,
            "score": attempt.score,
            "percentage": attempt.percentage
        })

    return result