# from fastapi import APIRouter,Path,Query,HTTPException
# from pydantic import BaseModel, Field 
# from typing import Optional
# from fastapi import HTTPException
# from starlette import status
# app =  APIRouter()
# class Book(BaseModel):
#     id: int
#     title: str
#     author: str
#     description: str
#     rating: int

# BOOKS = [
#     Book(id=1, title='Computer Science Pro', author='codingwithroby', description='A very nice book!', rating=5),
#     Book(id=2, title='Be Fast with FastAPI', author='codingwithroby', description='A great book!', rating=5),
#     Book(id=3, title='Master Endpoints', author='codingwithroby', description='A awesome book!', rating=5),
#     Book(id=4, title='HP1', author='Author 1', description='Book Description', rating=2),
#     Book(id=5, title='HP2', author='Author 2', description='Book Description', rating=3),
#     Book(id=6, title='HP3', author='Author 3', description='Book Description', rating=1)
# ]

# # pydantic
# class BookRequest(BaseModel):
#     id: int
#     title:str = Field(min_length=3)
#     author:str = Field(min_length=3)
#     description:str = Field(min_length=3, max_length=100)
#     rating:int = Field(gt=0, lt=6)


#     model_config = {
#         "json_schema_extra":{
#             "example":{
#                 "id":3,
#                 "title" : "Code with ram",
#                 "author" : "Ram",
#                 "description":"best book",
#                 "rating" : 5
#             }
#         }
#     }



# @app.post("/add_book")
# def add_book(book:BookRequest,staus_code = status.HTTP_201_CREATED):
#     new_book = Book(**book.dict())
#     BOOKS.append(new_book)
#     return BOOKS

# # get book by id

# @app.get("/get_book/{book_id}", status_code=status.HTTP_200_OK)
# def get_book(book_id:int):
#     for book in BOOKS:
#         if book.id == book_id:
#             return book
#     raise HTTPException(status_code=404, detail="Book not found")


# # get book by rating

# @app.get("/book")
# def book_by_rating(rating:int):
#     books_to_return =[]
#     for book in BOOKS:
#         if book.rating==rating:
#             books_to_return.append(book)
#     return books_to_return

# # update book
# @app.put("/update/{book_id}",status_code=status.HTTP_204_NO_CONTENT)
# def update_book(book:BookRequest, book_id:int):
#     book_changed= False
#     for i in range(len(BOOKS)):
#         if BOOKS[i].id == book_id:
#             BOOKS[i] = book
#             book_changed= True
#             return "book updated sucessfully"
#     if not book_changed:
#         raise HTTPException(status_code=404,detail="book not found")
        
    
# #  query validation 

# @app.delete("/delete/")
# def delete_book(book_id:int=Query(gt=0)):
#     for i in range(len(BOOKS)):
#         if BOOKS[i].id == book_id:
#             BOOKS.pop(i)
#             break
#     return BOOKS

