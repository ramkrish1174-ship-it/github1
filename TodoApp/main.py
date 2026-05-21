from fastapi import FastAPI, Header,Request
from typing import Optional
from pydantic import BaseModel
from fastapi.templating import Jinja2Templates
app = FastAPI()

# # path parameter
# # @app.get("/greet/{name}")
# # def get_name(name:str) -> dict:
# #     return {"message": f"hi {name}"}

# # query parameter

# # @app.get("/greet")
# # def get_name(name:str):
# #     return {"message":f"hello {name}"}

# # path and query parameter

# # @app.get("/greet/{name}")
# # def get_names(name:str,age:int):
# #     return {"message":f"hello {name}, age: {age}"}

# # optional query parameter
# # @app.get("/greet")
# # def default(name:Optional[str]="Ram",age:Optional[int]="25"):
# #     return {"message":f"name is {name}, age is : {age}"}

# # # Request body
# # class Bookschema(BaseModel):
# #     title : str
# #     author : str

# # @app.post("/greet")
# # def submit(book_data:Bookschema):
# #     return {
# #         "title": book_data.title,
# #         "author" : book_data.author
# #     }


# # @app.get("/get_headers")
# # def get_headers(
# #     accept:str = Header(None),
# #     content_type:str = Header(None),
# #     user_agent:str = Header(None),
# #     host:str = Header(None)
# # ):
# #     request_headers = {}

# #     request_headers["Accept"] = accept
# #     request_headers["Content-Type"] =content_type
# #     request_headers["User-Agent"] = user_agent
# #     request_headers["Host"] = host
# #     return request_headers



# # CRUD with List


# from fastapi import FastAPI, status
# from fastapi.exceptions import HTTPException
# from pydantic import BaseModel
# from typing import List
# # from src.books.routes  import book_router
# # from src.books.books2 import app
# # import src.books.books2 as books2       
# version = "v1"

# app = FastAPI(
#     # version=version
# )

# # app.include_router(book_router ,prefix="/api/{version}/books", tags=["books"])
# # app.include_router(book_router , tags=["books"])




# # app.include_router(books2.app, tags=["books_new"])



from fastapi import FastAPI
from TodoApp import models
from TodoApp.database import engine
from TodoApp.routers import todos
from TodoApp.routers import auth
from TodoApp.routers import admin
from TodoApp.routers import user
from fastapi.staticfiles import StaticFiles
# app = FastAPI()

templates = Jinja2Templates(directory="TodoApp/templates")
app.mount("/static", StaticFiles(directory="TodoApp/static"),name="static")

models.Base.metadata.create_all(bind=engine)
app.include_router(todos.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(user.router)


@app.get("/jinja")
def get_template(request:Request):
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context={"request": request}
    )