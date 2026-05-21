from fastapi import Depends,APIRouter,HTTPException,status
from TodoApp.deps import get_db
from sqlalchemy.orm import Session
from .auth import get_current_user
from passlib.context import CryptContext
from typing import Annotated
from TodoApp.models import User
from pydantic import BaseModel,Field

router = APIRouter(prefix="/user",tags=["user"])

class UserVerification(BaseModel):
    currentpassword:str
    newpassword:str = Field(min_length=6)

user_dependency = Annotated[dict, Depends(get_current_user)]
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated='auto')

@router.get("/current_user",status_code=status.HTTP_200_OK)
def get_users(user:user_dependency,db:Session=Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not found")
    return db.query(User).filter(User.id==user.get('id')).first()


@router.put("/change")
def change_password(user:user_dependency,userverification:UserVerification,db:Session=Depends(get_db)):
    user_db = db.query(User).filter(User.id==user.get('id')).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="authentication failed")
    if not bcrypt_context.verify(userverification.currentpassword, user_db.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="authentication failed")
    
    user_db.hashed_password = bcrypt_context.hash(userverification.newpassword)
    db.add(user_db)
    db.commit()

