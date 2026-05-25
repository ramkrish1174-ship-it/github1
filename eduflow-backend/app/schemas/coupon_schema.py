from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    max_usage: int = 1
    expires_at: Optional[datetime] = None
    course_id: int | None = None


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    max_usage: int
    used_count: int
    is_active: bool
    course_id: int | None = None

    class Config:
        from_attributes = True