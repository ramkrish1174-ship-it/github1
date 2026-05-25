from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float
    level: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    level: Optional[str] = None
    is_featured: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    price: float
    status: str
    owner_id: int
    status: Optional[str] = None      
    owner_id: Optional[int] = None 
    average_rating: Optional[float] = 0
    total_reviews: Optional[int] = 0
    is_premium: bool = False
    is_enrolled: bool = False
    has_subscription_access: bool = False
    created_at: datetime
    level: str
    is_featured: bool

    class Config:
        from_attributes = True