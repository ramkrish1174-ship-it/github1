from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.routes.deps import get_db, get_current_user
from app.utils.notification_helper import create_notification
from app.models.assignment import Assignment
from app.models.assignment_submission import AssignmentSubmission

from app.models.module import Module
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User

from app.schemas.assignment_schema import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentSubmissionCreate,
    AssignmentSubmissionResponse,
    GradeSubmission
)

router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)


# =====================================================
# CREATE ASSIGNMENT
# =====================================================

@router.post("/{module_id}", response_model=AssignmentResponse)
def create_assignment(
    module_id: int,
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    module = db.query(Module).filter(
        Module.id == module_id
    ).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    if user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors")

    if course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    assignment = Assignment(
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        course_id=course.id,
        module_id=module_id,
        created_by=user.id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course.id
    ).all()

    for enrollment in enrollments:
        create_notification(
            db=db,
            user_id=enrollment.user_id,
            title="New Assignment",
            message=f"{assignment.title} added in {course.title}"
        )

    return assignment


# =====================================================
# GET MODULE ASSIGNMENTS
# =====================================================

@router.get(
    "/module/{module_id}",
    response_model=list[AssignmentResponse]
)
def get_assignments(
    module_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    module = db.query(Module).filter(
        Module.id == module_id
    ).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    course = db.query(Course).filter(
        Course.id == module.course_id
    ).first()

    # students must enroll
    if user.role != "instructor":

        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course.id
        ).first()

        if not enrolled:
            raise HTTPException(
                status_code=403,
                detail="Not enrolled"
            )

    return db.query(Assignment).filter(
        Assignment.module_id == module_id
    ).all()


# =====================================================
# SUBMIT ASSIGNMENT
# =====================================================

@router.post(
    "/submit/{assignment_id}",
    response_model=AssignmentSubmissionResponse
)
def submit_assignment(
    assignment_id: int,
    data: AssignmentSubmissionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can submit"
        )

    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    enrolled = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == assignment.course_id
    ).first()

    if not enrolled:
        raise HTTPException(
            status_code=403,
            detail="Not enrolled"
        )

    already_submitted = db.query(
        AssignmentSubmission
    ).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == user.id
    ).first()

    if already_submitted:
        raise HTTPException(
            status_code=400,
            detail="Already submitted"
        )

    status = "submitted"

    if assignment.due_date:
        if datetime.utcnow() > assignment.due_date.replace(tzinfo=None):
            status = "late"

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=user.id,
        submission_text=data.submission_text,
        file_url=data.file_url,
        status=status
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    course = db.query(Course).filter(
        Course.id == assignment.course_id
    ).first()

    
    create_notification(
        db=db,
        user_id=course.owner_id,
        title="Assignment Submitted",
        message=f"{user.name} submitted {assignment.title}"
    )

    create_notification(
        db=db,
        user_id=user.id,
        title="Assignment Submitted",
        message=f"You submitted {assignment.title}"
    )

    return submission



@router.get(
    "/my-submissions",
    response_model=list[AssignmentSubmissionResponse]
)
def my_submissions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    return db.query(AssignmentSubmission).filter(
        AssignmentSubmission.student_id == user.id
    ).all()



@router.get(
    "/submissions/{assignment_id}",
    response_model=list[AssignmentSubmissionResponse]
)
def view_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    course = db.query(Course).filter(
        Course.id == assignment.course_id
    ).first()

    if course.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    return db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).all()




@router.put(
    "/grade/{submission_id}",
    response_model=AssignmentSubmissionResponse
)
def grade_submission(
    submission_id: int,
    data: GradeSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    submission = db.query(
        AssignmentSubmission
    ).filter(
        AssignmentSubmission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()

    course = db.query(Course).filter(
        Course.id == assignment.course_id
    ).first()

    if course.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    submission.grade = data.grade
    submission.feedback = data.feedback
    submission.status = "graded"
    submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)
    create_notification(
        db=db,
        user_id=submission.student_id,
        title="Assignment Graded",
        message=f"{assignment.title} has been graded"
    )

    return submission