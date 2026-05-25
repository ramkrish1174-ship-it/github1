from pydantic import BaseModel
from datetime import datetime


class ProgressCreate(BaseModel):
    completed: bool = False
    watch_percentage: float = 0


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed: bool
    watch_percentage: float
    updated_at: datetime

    class Config:
        from_attributes = True