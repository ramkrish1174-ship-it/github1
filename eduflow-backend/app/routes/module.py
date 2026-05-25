from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.deps import get_db, get_current_user
from app.models.module import Module
from app.models.course import Course
from app.schemas.module_schema import ModuleCreate, ModuleResponse
from app.models.user import User
from app.models.enrollment import Enrollment
router = APIRouter(prefix="/modules", tags=["Modules"])


#  CREATE MODULE (Instructor only + owner check)
@router.post("/{course_id}", response_model=ModuleResponse)
def create_module(
    course_id: int,
    data: ModuleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    module = Module(**data.dict(), course_id=course_id)

    db.add(module)
    db.commit()
    db.refresh(module)

    return module


#  GET MODULES (Public read)
@router.get("/{course_id}", response_model=list[ModuleResponse])
def get_modules(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    #  access control
    if user.role != "instructor":
        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course_id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="Not enrolled")

    return db.query(Module).filter(
        Module.course_id == course_id
    ).order_by(Module.id).all()


#  DELETE MODULE (Instructor )
@router.delete("/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    course = db.query(Course).filter(Course.id == module.course_id).first()

    if user.role != "instructor" or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(module)
    db.commit()

    return {"message": "Module deleted"}