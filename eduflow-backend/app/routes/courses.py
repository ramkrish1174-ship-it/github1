from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.deps import get_db, get_current_user
from app.models.course import Course
from app.models.user import User
from app.models.review import Review
from sqlalchemy import func
from app.models.wishlist import Wishlist
from app.models.payment import Payment
from app.models.announcement import Announcement
from app.models.live_class import LiveClass
from app.models.forum_post import ForumPost
from app.schemas.course_schema import (
    CourseCreate,
    CourseResponse,
    CourseUpdate
)
from app.utils.course_access import has_course_access
from app.models.announcement import Announcement
from app.utils.email_service import send_email
import asyncio
from fastapi_cache.decorator import cache
from app.core.limiter import limiter
from fastapi import Request

from app.models.enrollment import Enrollment
router = APIRouter(prefix="/courses", tags=["Courses"])


#  Search Courses (PUBLIC)
@router.get("/search/", response_model=list[CourseResponse])
@cache(expire=120)
@limiter.limit("20/minute")
def search_course(request: Request,query: str, db: Session = Depends(get_db)):
    return db.query(Course).filter(
        Course.title.contains(query),
        Course.status == "published"
    ).all()


#  Filter by Category (PUBLIC)
@router.get("/category/{category}", response_model=list[CourseResponse])
@cache(expire=120)
@limiter.limit("20/minute")
def filter_by_category(request:Request,category: str, db: Session = Depends(get_db)):
    return db.query(Course).filter(
        Course.category == category,
        Course.status == "published"
    ).all()


@router.get("/", response_model=list[CourseResponse])
# @cache(expire=120)
@limiter.limit("20/minute")
def get_courses(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    courses = db.query(Course).filter(
        Course.status == "published"
    ).all()

    result = []

    for course in courses:
        has_access = False
        has_subscription_access = False

        if current_user:
            access = has_course_access(
                db,
                current_user.id,
                course
            )
            is_enrolled = access["is_enrolled"]

            has_subscription_access = access["has_subscription_access"]

        avg_rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.course_id == course.id
        ).scalar()

        total_reviews = db.query(Review).filter(
            Review.course_id == course.id
        ).count()

        result.append({
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "level": course.level,
        "price": course.price,
        "status": course.status,
        "is_featured": course.is_featured,
        "is_premium": course.is_premium,
        "is_enrolled": is_enrolled,
        "has_subscription_access": has_subscription_access,
        "owner_id": course.owner_id,
        "created_at": course.created_at,
        "average_rating": round(avg_rating or 0, 1),
        "total_reviews": total_reviews
    })

    return result


#  Instructor Courses
@router.get("/my", response_model=list[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    return db.query(Course).filter(
        Course.owner_id == current_user.id
    ).all()


#  Create Course (Instructor ONLY)
@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create courses")

    new_course = Course(
        **course.dict(),
        owner_id=current_user.id,
        status="draft"
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@router.get("/{course_id}", response_model=CourseResponse)
@cache(expire=300)
@limiter.limit("40/minute")
def get_course(request:Request,course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != "published":
        raise HTTPException(status_code=403, detail="Course not available")

    return course


#  Update Course (Owner ONLY)
@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    updated_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in updated_data.dict(exclude_unset=True).items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    return course











# upadate the single field of the course
@router.patch("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    updated_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if updated_data.title:
        course.title = updated_data.title
    if updated_data.description:
        course.description = updated_data.description
    if updated_data.category:
        course.category = updated_data.category
    if updated_data.price:
        course.price = updated_data.price
    if updated_data.level:
        course.level = updated_data.level

    db.commit()
    db.refresh(course)
    return course

    


# Delete Course (Owner ONLY)
@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.query(Wishlist).filter(
        Wishlist.course_id == course_id
    ).delete()

    db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).delete()

    db.query(Review).filter(
        Review.course_id == course_id
    ).delete()

    db.query(Payment).filter(
        Payment.course_id == course_id
    ).delete()

    db.query(ForumPost).filter(
        ForumPost.course_id == course_id
    ).delete()
    db.query(Announcement).filter(
        Announcement.course_id == course_id
    ).delete()
    db.query(LiveClass).filter(
        LiveClass.course_id == course_id
    ).delete()

    db.delete(course)

    db.commit()

    return {"message": "Deleted"}


#  Publish Course
@router.put("/{course_id}/publish")
def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if course.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft can be published")

    course.status = "published"
    db.commit()

    return {"message": "Published"}


#  Archive Course
@router.put("/{course_id}/archive")
def archive_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    course.status = "archived"
    db.commit()

    return {"message": "Archived"}


@router.get("/advanced-search/")
@cache(expire=120)
@limiter.limit("20/minute")
def advanced_search(
    request: Request,
    query: str = "",
    category: str = "",
    level: str = "",
    min_price: float = 0,
    max_price: float = 999999,
    min_rating: float = 0,
    db: Session = Depends(get_db)
):

    courses = db.query(Course).filter(
        Course.status == "published"
    ).all()

    result = []

    for course in courses:

        avg_rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.course_id == course.id
        ).scalar() or 0

        if query and query.lower() not in course.title.lower():
            continue

        if category and course.category != category:
            continue

        if level and course.level != level:
            continue

        if course.price < min_price:
            continue

        if course.price > max_price:
            continue

        if avg_rating < min_rating:
            continue

        result.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "category": course.category,
            "level": course.level,
            "price": course.price,
            "status": course.status,
            "owner_id": course.owner_id,
            "average_rating": round(avg_rating, 1),
            "created_at": course.created_at,
            "is_featured": course.is_featured
        })

    return result

@router.get("/trending/")
@cache(expire=300)
@limiter.limit("20/minute")
def trending_courses(
    request: Request,
    db: Session = Depends(get_db)
):

    courses = db.query(Course).filter(
        Course.status == "published"
    ).all()

    result = []

    for course in courses:

        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id == course.id
        ).count()

        result.append({
            "course": course,
            "enrollments": enrollments
        })

    result.sort(
        key=lambda x: x["enrollments"],
        reverse=True
    )

    return [
        r["course"]
        for r in result[:10]
    ]

@router.get("/featured/")
@cache(expire=300)
@limiter.limit("20/minute")
def featured_courses(
    request: Request,
    db: Session = Depends(get_db)
):

    return db.query(Course).filter(
        Course.is_featured == True,
        Course.status == "published"
    ).all()

@router.get("/recommended/me")
def recommended_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()

    categories = []

    for e in enrollments:

        course = db.query(Course).filter(
            Course.id == e.course_id
        ).first()

        if course.category not in categories:
            categories.append(course.category)

    return db.query(Course).filter(
        Course.category.in_(categories),
        Course.status == "published"
    ).limit(10).all()


@router.post("/{course_id}/announcement")
async def send_course_announcement(
    course_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if current_user.role != "instructor":
        raise HTTPException(
            status_code=403,
            detail="Only instructors"
        )

    if course.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    announcement = Announcement(
        course_id=course.id,
        instructor_id=current_user.id,
        title="Course Announcement",
        message=data["message"]
    )

    db.add(announcement)

    db.commit()

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course.id
    ).all()

    for enrollment in enrollments:

        student = db.query(User).filter(
            User.id == enrollment.user_id
        ).first()

        if student.email_notifications:

            await send_email(
                db=db,
                recipient=student.email,
                subject=f"New Announcement - {course.title}",
                body=f"""
                <h2>Course Announcement 📢</h2>

                <p>{data["message"]}</p>
                """
            )

    return {
        "message": "Announcement emails sent"
    }


