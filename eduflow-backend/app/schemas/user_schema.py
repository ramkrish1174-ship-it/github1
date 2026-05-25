from pydantic import BaseModel, EmailStr,Field,field_validator
from datetime import datetime
from typing import Optional


import re
class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    role: str = "student"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()

        if not re.match(r"^[A-Za-z ]+$", value):
            raise ValueError("Name should contain only alphabets and spaces")

        return value
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        # Minimum:
        # 1 uppercase
        # 1 lowercase
        # 1 number
        # minimum 6 chars
        pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$"

        if not re.match(pattern, value):
            raise ValueError(
                "Password must contain uppercase, lowercase and number"
            )

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str =  Field(..., min_length=6, max_length=72)

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    phone: Optional[str] = None
    email_notifications: bool | None = True
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    bio: Optional[str] = Field(None,max_length=300)
    phone: Optional[str] = Field(None,min_length=10,max_length=10)
    email_notifications: bool | None = True

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):

        if value is None:
            return value

        value = value.strip()

        if not re.match(r"^[A-Za-z ]+$", value):
            raise ValueError(
                "Name should contain only alphabets and spaces"
            )

        return value
    
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):

        if value is None:
            return value

        # exactly 10 digits
        if not re.match(r"^\d{10}$", value):
            raise ValueError(
                "Phone number must contain exactly 10 digits"
            )

        return value
    



class ChangePassword(BaseModel):
    old_password: str
    new_password: str =Field(...,min_length=6,max_length=72)


    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value):

        pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$"

        if not re.match(pattern, value):
            raise ValueError(
                "Password must contain uppercase, lowercase and number"
            )

        return value


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4,max_length=6)
    new_password: str = Field(min_length=6,max_length=72)

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value):

        # only digits
        if not re.match(r"^\d{4,6}$", value):
            raise ValueError(
                "OTP must contain only digits"
            )

        return value

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value):

        pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$"

        if not re.match(pattern, value):
            raise ValueError(
                "Password must contain uppercase, lowercase and number"
            )

        return value