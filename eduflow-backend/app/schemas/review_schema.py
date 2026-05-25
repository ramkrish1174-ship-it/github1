from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    rating: int
    comment: str


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    rating: int
    comment: str
    created_at: datetime
    reviewer_name: str

    class Config:
        from_attributes = True