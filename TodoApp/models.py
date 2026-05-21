from sqlalchemy import Column, String, Integer, Boolean,ForeignKey
from TodoApp.database import Base   
class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True,index=True)
    email = Column(String, unique=True)
    username = Column(String,unique=True)
    firstname = Column(String)
    lastname = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String)
    # phone_number = Column(String)


class Todo(Base):
    __tablename__ ="todos"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    priority = Column(Integer)
    complete = Column(Boolean, default = False)
    owner_id = Column(Integer, ForeignKey("users.id"))