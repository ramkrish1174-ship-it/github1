from pydantic import BaseModel
from datetime import datetime


class ForumPostCreate(BaseModel):
    title: str
    content: str


class ForumReplyCreate(BaseModel):
    content: str


class ForumPostResponse(BaseModel):
    id: int
    course_id: int
    user_id: int
    title: str
    content: str
    is_resolved: bool
    upvotes: int
    created_at: datetime

    class Config:
        from_attributes = True


class ForumReplyResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True