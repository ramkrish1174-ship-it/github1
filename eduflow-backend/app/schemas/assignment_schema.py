from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: Optional[datetime] = None




class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: str
    due_date: Optional[datetime]
    course_id: int
    module_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True




class AssignmentSubmissionCreate(BaseModel):
    submission_text: Optional[str] = None
    file_url: Optional[str] = None




class GradeSubmission(BaseModel):
    grade: int
    feedback: Optional[str] = None




class AssignmentSubmissionResponse(BaseModel):
    id: int

    assignment_id: int
    student_id: int

    submission_text: Optional[str]
    file_url: Optional[str]

    status: str

    grade: Optional[int]
    feedback: Optional[str]

    submitted_at: datetime
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True