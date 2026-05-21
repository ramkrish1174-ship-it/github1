from datetime import timedelta, datetime, timezone
from jose import jwt

from fastapi import APIRouter,Depends,HTTPException,Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from TodoApp.deps import get_db
from starlette import status
from TodoApp.schemas.user_schema import UserCreate
from TodoApp.models import User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from typing import Annotated
from fastapi.templating import Jinja2Templates

router = APIRouter()

templates = Jinja2Templates(directory="TodoApp/templates")



SECRET_KEY = '197b2c37c391bed93fe80344fe73b806947a65e36206e05a1a23c2fa12702fe3'
ALGORITHM = 'HS256'
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

class Token(BaseModel):
    access_token: str
    token_type: str

@router.get("/login-page")
def render_login_page(request:Request):
    return templates.TemplateResponse(request=request,name="login.html",context={"request": request})

def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(username, password, db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user


async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        user_role: str = payload.get('role')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user.')
        return {'username': username, 'id': user_id, 'user_role': user_role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user.')

# @router.get("/get_user")
# def user():
#     return {"user":"authenticated"}

@router.post("/create_user", status_code = status.HTTP_201_CREATED)
def create_user(user_create:UserCreate,
                db:Session=Depends(get_db)):
    user_data = User(
        email = user_create.email,
        username = user_create.username,
        firstname = user_create.first_name,
        lastname= user_create.last_name,
        hashed_password = bcrypt_context.hash(user_create.password),
        is_active = True,
        role = user_create.role,
        phone_number = user_create.phone_number


    )
    db.add(user_data)
    db.commit()
    

@router.post("/token", response_model = Token)
def user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        return "Authentication failed"
    token = create_access_token(user.username, user.id, user.role, timedelta(minutes=20))
    return {
        "access_token": token,
        "token_type": "bearer"
    }