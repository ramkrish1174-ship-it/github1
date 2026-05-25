from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.utils.notification_helper import create_notification
from app.models.course import Course
from app.routes.deps import get_db, get_current_user

from app.models.review import Review
from app.models.enrollment import Enrollment
from app.models.user import User

from app.schemas.review_schema import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse
)

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)



@router.post("/{course_id}")
def create_review(
    course_id: int,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="Enroll before reviewing"
        )

    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Review already submitted"
        )

    review = Review(
        user_id=current_user.id,
        course_id=course_id,
        rating=data.rating,
        comment=data.comment
    )

    db.add(review)

    db.commit()
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    create_notification(
        db=db,
        user_id=course.owner_id,
        title="New Review",
        message=f"{current_user.name} reviewed your course"
    )

    return {
        "message": "Review submitted"
    }



@router.get("/{course_id}",
response_model=list[ReviewResponse])
def get_reviews(
    course_id: int,
    db: Session = Depends(get_db)
):

    reviews = db.query(Review).filter(
        Review.course_id == course_id
    ).order_by(
        Review.created_at.desc()
    ).all()

    result = []

    for review in reviews:
        result.append({
            "id": review.id,
            "user_id": review.user_id,
            "course_id": review.course_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "reviewer_name": review.user.name
        })

    return result



@router.put("/{review_id}")
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    if data.rating is not None:
        review.rating = data.rating

    if data.comment is not None:
        review.comment = data.comment

    db.commit()

    return {
        "message": "Review updated"
    }


# DELETE REVIEW
@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    db.delete(review)

    db.commit()

    return {
        "message": "Review deleted"
    }


# COURSE RATING
@router.get("/rating/{course_id}")
def course_rating(
    course_id: int,
    db: Session = Depends(get_db)
):

    avg_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.course_id == course_id
    ).scalar()

    total_reviews = db.query(Review).filter(
        Review.course_id == course_id
    ).count()

    return {
        "average_rating": round(avg_rating or 0, 1),
        "total_reviews": total_reviews
    }