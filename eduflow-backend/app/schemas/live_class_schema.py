from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LiveClassCreate(BaseModel):
    title: str
    description: str
    meeting_link: str
    start_time: datetime
    end_time: datetime


class LiveClassUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_link: Optional[str] = None
    recording_link: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None


class LiveClassResponse(BaseModel):
    id: int
    course_id: int
    instructor_id: int

    title: str
    description: str

    meeting_link: str
    recording_link: Optional[str] = None

    start_time: datetime
    end_time: datetime

    status: str

    created_at: datetime

    class Config:
        from_attributes = True