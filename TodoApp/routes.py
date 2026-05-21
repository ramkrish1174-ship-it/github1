# from fastapi import Depends,APIRouter,HTTPException,status
# from TodoApp.deps import get_db
# from sqlalchemy.orm import Session
# from TodoApp.models import Todo
# from TodoApp.schemas.schemas import TodoCreate,TodoSchema
# router = APIRouter()

# @router.get("/get_all",response_model=list[TodoSchema],status_code = status.HTTP_200_OK)
# def get_all(db:Session=Depends(get_db)):
#     todo = db.query(Todo).all()
#     if not todo:
#         raise HTTPException(status_code=404, detail="todos not found")
#     else:
#         return todo

# @router.get("/get_todo/{todo_id}",response_model=TodoSchema,status_code = status.HTTP_200_OK)
# def get_item(todo_id:int,db:Session = Depends(get_db)):
#     todo = db.query(Todo).filter(Todo.id==todo_id).first()
#     if not todo:
#         raise HTTPException(status_code=404,detail="todo not found")
#     else:
#         return todo
    
    

# @router.post("/post_item",response_model=TodoSchema,status_code=status.HTTP_201_CREATED)
# def create_todo(todo:TodoCreate, db:Session = Depends(get_db)):
#     db_todo = Todo(**todo.dict())
#     db.add(db_todo)
#     db.commit()
#     db.refresh(db_todo)
#     if not db_todo :
#         raise HTTPException(status_code=404,detail="give the ccorrect detils")
#     return db_todo

# @router.delete("/delete/{todo_id}",status_code = status.HTTP_200_OK)
# def delete_route(todo_id:int,db:Session=Depends(get_db)):
#     todo = db.query(Todo).filter(Todo.id==todo_id).first()
#     db.delete(todo)
#     db.commit()
#     return {"detail":"deleted sucessfully"}

# @router.put("/update/{todo_id}",status_code=status.HTTP_204_NO_CONTENT)
# def update_todo(todo_id:int,updated:TodoCreate,db:Session=Depends(get_db)):
#     db_todo = db.query(Todo).filter(Todo.id ==todo_id).first()
#     if not db_todo:
#         raise HTTPException(status_code=404,detail="todo not found")
#     else:
#         db.add(db_todo)
#         db.commit()
#         db.refresh(db_todo)
#         return "todo updated sucessfully"