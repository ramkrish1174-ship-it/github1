from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user

from app.models.wishlist import Wishlist
from app.models.course import Course
from app.models.user import User

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


# ADD TO WISHLIST
@router.post("/{course_id}")
def add_to_wishlist(
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

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user.id,
        Wishlist.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already in wishlist"
        )

    wishlist = Wishlist(
        user_id=user.id,
        course_id=course_id
    )

    db.add(wishlist)

    db.commit()

    return {
        "message": "Added to wishlist"
    }


# GET MY WISHLIST
@router.get("/")
def get_wishlist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    items = db.query(Wishlist).filter(
        Wishlist.user_id == user.id
    ).all()

    result = []

    for item in items:

        course = db.query(Course).filter(
            Course.id == item.course_id
        ).first()

        result.append(course)

    return result


# REMOVE FROM WISHLIST
@router.delete("/{course_id}")
def remove_wishlist(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    item = db.query(Wishlist).filter(
        Wishlist.user_id == user.id,
        Wishlist.course_id == course_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Not found"
        )

    db.delete(item)

    db.commit()

    return {
        "message": "Removed from wishlist"
    }