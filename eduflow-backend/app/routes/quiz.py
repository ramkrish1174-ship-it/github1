from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user

from app.models.quiz import Quiz
from app.models.question import Question
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz_answer import QuizAnswer

from app.models.lesson import Lesson
from app.models.module import Module
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.utils.notification_helper import create_notification
from app.schemas.quiz_schema import (
    QuizCreate,
    QuizResponse,
    QuestionCreate,
    QuestionResponse,
    QuizSubmit,
    QuizResultResponse
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


# CREATE QUIZ
@router.post("/{lesson_id}", response_model=QuizResponse)
def create_quiz(
    lesson_id: int,
    data: QuizCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    module = db.query(Module).filter(
        Module.id == lesson.module_id
    ).first()

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    existing_quiz = db.query(Quiz).filter(
        Quiz.lesson_id == lesson_id
    ).first()

    if existing_quiz:
        raise HTTPException(
            status_code=400,
            detail="Quiz already exists for this lesson"
        )

    quiz = Quiz(
        title=data.title,
        lesson_id=lesson_id
    )

    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    # NOTIFY ENROLLED STUDENTS
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course.id
    ).all()

    for e in enrollments:
        create_notification(
            db=db,
            user_id=e.user_id,
            title="New Quiz Added",
            message=f"A new quiz was added in {course.title}"
        )

    return quiz


# ADD QUESTION
@router.post("/question/{quiz_id}", response_model=QuestionResponse)
def add_question(
    quiz_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    lesson = db.query(Lesson).filter(
        Lesson.id == quiz.lesson_id
    ).first()

    module = db.query(Module).filter(
        Module.id == lesson.module_id
    ).first()

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    question = Question(
        quiz_id=quiz_id,
        question=data.question,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_answer=data.correct_answer
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question

# GET QUIZ BY LESSON
@router.get("/lesson/{lesson_id}")
def get_quiz_by_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(
    Quiz.lesson_id == lesson_id
).order_by(Quiz.id.desc()).first()

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )

    questions = db.query(Question).filter(
        Question.quiz_id == quiz.id
    ).all()
    formatted_questions = []

    for q in questions:
        formatted_questions.append({
            "id": q.id,
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
        })

    return {
    "quiz_id": quiz.id,
    "title": quiz.title,
    "questions": formatted_questions
}


# GET QUIZ
@router.get("/{quiz_id}")
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    lesson = db.query(Lesson).filter(
        Lesson.id == quiz.lesson_id
    ).first()

    module = db.query(Module).filter(
        Module.id == lesson.module_id
    ).first()

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    if user.role != "instructor":
        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course.id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="Not enrolled")

    questions = db.query(Question).filter(
        Question.quiz_id == quiz_id
    ).all()
    formatted_questions = []

    for q in questions:
        formatted_questions.append({
            "id": q.id,
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
        })

    return {
    "quiz_id": quiz.id,
    "title": quiz.title,
    "questions": formatted_questions
}



# SUBMIT QUIZ
@router.post("/submit/{quiz_id}", response_model=QuizResultResponse)
def submit_quiz(
    quiz_id: int,
    data: QuizSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(Question).filter(
        Question.quiz_id == quiz_id
    ).all()

    score = 0

    attempt = QuizAttempt(
        user_id=user.id,
        quiz_id=quiz_id
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for q in questions:
        selected = data.answers.get(str(q.id))

        correct = selected == q.correct_answer

        if correct:
            score += 1

        answer = QuizAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_answer=selected,
            is_correct=correct
        )

        db.add(answer)

    total_questions = len(questions)

    percentage = 0

    if total_questions > 0:
        percentage = (score / total_questions) * 100

    attempt.score = score
    attempt.percentage = percentage

    db.commit()

    lesson = db.query(Lesson).filter(
        Lesson.id == quiz.lesson_id
    ).first()

    module = db.query(Module).filter(
        Module.id == lesson.module_id
    ).first()

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    create_notification(
        db=db,
        user_id=user.id,
        title="Quiz Submitted",
        message=f"You scored {score}/{total_questions} in {course.title}"
    )

    return {
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage
    }


# GET MY RESULTS
@router.get("/results/me")
def my_results(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id
    ).all()

    return attempts