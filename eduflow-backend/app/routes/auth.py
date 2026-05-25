from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, UserLogin
from app.models.user import User
from app.routes.deps import get_db
from app.utils.hash import hash_password, verify_password
from app.core.security import create_access_token
from app.utils.email_service import send_email
import asyncio
import random
from app.models.password_reset_otp import PasswordResetOTP
from app.schemas.user_schema import (ForgotPasswordRequest,ResetPasswordRequest)
from app.utils.email_service import send_email
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if user.role not in ["student", "instructor"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    asyncio.run(
        send_email(
            db=db,
            recipient=new_user.email,
            subject="Welcome to EduFlow 🎉",
            body=f"""
            <h2>Welcome {new_user.name}</h2>
            <p>Your account has been created successfully.</p>
            """
        )
    )

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account suspended"
        )

    token = create_access_token({"user_id": db_user.id})

    return {"access_token": token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    otp = str(random.randint(100000, 999999))

    otp_entry = PasswordResetOTP(
        email=data.email,
        otp=otp
    )

    db.add(otp_entry)

    db.commit()


    asyncio.run(
        send_email(
            db=db,
            recipient=data.email,
            subject="EduFlow Password Reset OTP",
            body=f"""
            <h2>Password Reset</h2>
            <p>Your OTP is:</p>
            <h1>{otp}</h1>
            """
        )
    )

    return {
        "message": "OTP sent successfully"
    }

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    otp_entry = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == data.email,
        PasswordResetOTP.otp == data.otp
    ).first()

    if not otp_entry:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password_hash = hash_password(
        data.new_password
    )
    db.commit()
    return {
        "message": "Password reset successful"
    }