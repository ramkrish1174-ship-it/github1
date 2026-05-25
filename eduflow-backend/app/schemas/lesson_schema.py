from pydantic import BaseModel

class LessonCreate(BaseModel):
    title: str
    content: str
    type: str
    order: int = 0

class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    type: str
    order: int

    class Config:
        from_attributes = True