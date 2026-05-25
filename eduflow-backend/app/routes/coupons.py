from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import or_
from app.routes.deps import get_db, get_current_user
from app.models.user import User
from app.models.coupon import Coupon
from app.schemas.coupon_schema import (
    CouponCreate,
    CouponResponse
)

router = APIRouter(
    prefix="/coupons",
    tags=["Coupons"]
)


# CREATE COUPON
@router.post("/", response_model=CouponResponse)
def create_coupon(
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "instructor":
        raise HTTPException(
            status_code=403,
            detail="Only instructors"
        )

    existing = db.query(Coupon).filter(
        Coupon.code == coupon.code
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Coupon already exists"
        )

    new_coupon = Coupon(**coupon.dict())

    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)

    return new_coupon


# VALIDATE COUPON
@router.get("/validate/{code}")
def validate_coupon(
    code: str,
    db: Session = Depends(get_db)
):

    coupon = db.query(Coupon).filter(
        Coupon.code == code,
        Coupon.is_active == True
    ).first()

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Invalid coupon"
        )

    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Coupon expired"
        )

    if coupon.used_count >= coupon.max_usage:
        raise HTTPException(
            status_code=400,
            detail="Coupon usage exceeded"
        )

    return {
        "valid": True,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value
    }

@router.get("/validate-course/{course_id}/{code}")
def validate_course_coupon(
    course_id: int,
    code: str,
    db: Session = Depends(get_db)
):

    print("course_id:", course_id)
    print("code:", code)

    all_coupons = db.query(Coupon).all()

    print("------ ALL COUPONS ------")

    for c in all_coupons:
        print(
            "ID:", c.id,
            "| CODE:", c.code,
            "| COURSE_ID:", c.course_id,
            "| ACTIVE:", c.is_active
        )

    coupon = db.query(Coupon).filter(
        Coupon.code == code,
        Coupon.is_active == True,
        or_(
            Coupon.course_id == course_id,
            Coupon.course_id == None
        )
    ).first()

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Invalid coupon"
        )

    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Coupon expired"
        )

    if coupon.used_count >= coupon.max_usage:
        raise HTTPException(
            status_code=400,
            detail="Coupon usage exceeded"
        )

    return {
        "valid": True,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value
    }