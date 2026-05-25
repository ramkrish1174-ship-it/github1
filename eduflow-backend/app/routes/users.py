from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user_schema import (UserResponse,UserUpdate,ChangePassword)
from app.utils.hash import verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/update")
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_data.name is not None:
        current_user.name = user_data.name

    if user_data.bio is not None:
        current_user.bio = user_data.bio

    if user_data.phone is not None:
        current_user.phone = user_data.phone

    if user_data.email_notifications is not None:
        current_user.email_notifications = (
            user_data.email_notifications
        )

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


#  Change Password
@router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}