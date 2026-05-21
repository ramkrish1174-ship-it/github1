from fastapi import Depends,APIRouter,HTTPException,status
from TodoApp.deps import get_db
from sqlalchemy.orm import Session
from TodoApp.models import Todo
from TodoApp.schemas.schemas import TodoCreate,TodoSchema
from .auth import get_current_user
from typing import Annotated
router = APIRouter()


user_dependency = Annotated[dict, Depends(get_current_user)]





@router.get("/get_all",response_model=list[TodoSchema],status_code = status.HTTP_200_OK)
def get_all(user:user_dependency,db:Session=Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="authentication failed")
    todo = db.query(Todo).filter(Todo.owner_id==user.get('id')).all()
    if not todo:
        raise HTTPException(status_code=404, detail="todos not found")
    else:
        return todo

@router.get("/get_todo/{todo_id}",response_model=TodoSchema,status_code = status.HTTP_200_OK)
def get_item(user:user_dependency,todo_id:int,db:Session = Depends(get_db)):
    todo = db.query(Todo)\
        .filter(Todo.id==todo_id)\
        .filter(Todo.owner_id==user.get('id')).first()
    if not todo:
        raise HTTPException(status_code=404,detail="todo not found")
    else:
        return todo
    
    

@router.post("/post_item",response_model=TodoSchema,status_code=status.HTTP_201_CREATED)
def create_todo(user:user_dependency,todo:TodoCreate, db:Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="authentication failed")
    db_todo = Todo(**todo.dict(),owner_id=user.get('id'))
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    if not db_todo :
        raise HTTPException(status_code=404,detail="give the ccorrect detils")
    return db_todo

@router.delete("/delete/{todo_id}",status_code = status.HTTP_200_OK)
def delete_route(user:user_dependency,todo_id:int,db:Session=Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id==todo_id).filter(Todo.owner_id==user.get('id')).first()
    db.delete(todo)
    db.commit()
    return {"detail":"deleted sucessfully"}

@router.put("/update/{todo_id}",status_code=status.HTTP_204_NO_CONTENT)
def update_todo(user:user_dependency,todo_id:int,updated:TodoCreate,db:Session=Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="authentication failed")
    db_todo =  db.query(Todo)\
        .filter(Todo.id==todo_id)\
        .filter(Todo.owner_id==user.get('id')).first()
    if not db_todo:
        raise HTTPException(status_code=404,detail="todo not found")
    else:
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return "todo updated sucessfully"