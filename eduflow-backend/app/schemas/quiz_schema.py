from pydantic import BaseModel
from typing import List


class QuizCreate(BaseModel):
    title: str


class QuizResponse(BaseModel):
    id: int
    title: str
    lesson_id: int

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str


class QuestionResponse(BaseModel):
    id: int

    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: dict


class QuizResultResponse(BaseModel):
    score: int
    total_questions: int
    percentage: float