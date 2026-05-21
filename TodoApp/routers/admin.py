from fastapi import Depends,APIRouter,HTTPException,status
from TodoApp.deps import get_db
from sqlalchemy.orm import Session
from TodoApp.models import Todo
from TodoApp.schemas.schemas import TodoCreate,TodoSchema
from .auth import get_current_user
from typing import Annotated
router = APIRouter(prefix="/admin",tags=["books"])


user_dependency = Annotated[dict, Depends(get_current_user)]


@router.get("/get_todos")
def get_todo(user:user_dependency,db:Session=Depends(get_db)):
    if user is None or user.get('user_role')!="admin":
        raise HTTPException(status_code=status.HTTP_201_CREATED, detail="Authentication failed")
    return db.query(Todo).all()
    
