# from fastapi import Body , FastAPI,APIRouter

# book_router = APIRouter()
# Books = [
#     {'title': 'Title One', 'author': 'Author One', 'category': 'science'},
#     {'title': 'Title Two', 'author': 'Author Two', 'category': 'science'},
#     {'title': 'Title Three', 'author': 'Author Three', 'category': 'history'},
#     {'title': 'Title Four', 'author': 'Author Four', 'category': 'math'},
#     {'title': 'Title Five', 'author': 'Author Five', 'category': 'math'},
#     {'title': 'Title Six', 'author': 'Author Two', 'category': 'math'}
# ]
# # @book_router.get("/get_books")
# # def get_all_books():
# #     return Books

# # path paremeters

# @book_router.get("/get_book/{book_title}")
# def get_book(book_title:str):
#     for book in Books:
#         if book.get('title').casefold() == book_title.casefold():
#             return book



# @book_router.get("/books/{book_name}")
# def get_book(book_name:str):
#     for book in Books:
#         if book.get('title').casefold() == book_name.casefold():
#             return {"the book is" : f"{book.title}"}
# @book_router.get("/books/book")
# def get_book():
#     return {"book will be ": "My fav"}


# @book_router.get("/books_list/{category}")
# def get_category(category:str,author:str):
#     books_to_return = []
#     for book in Books:
#         if book.get("category").casefold() == category.casefold() and book.get("author").casefold() ==author.casefold():
#             books_to_return.append(book)
#     return books_to_return


# @book_router.post("/create_book")
# def create_book(book=Body()):
#     Books.append(book)
#     return Books

# @book_router.put("/update_book")
# def update(updated=Body()):
#     for i in range(len(Books)):
#         if Books[i].get("title").casefold()==updated.get("title").casefold():
#             Books[i] = updated

#     return Books

# @book_router.delete("/delele/{book_title}")
# def delete_book(book_title:str):
#     for i in range(len(Books)):
#         if Books[i].get("title").casefold() == book_title.casefold():
#             Books.pop(i)
#             break
#     return Books